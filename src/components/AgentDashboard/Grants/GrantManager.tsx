"use client";

import { GrantDetail } from "@/components/AgentDashboard/Grants/GrantDetail";
import { HowItWorksDialog } from "@/components/AgentDashboard/Grants/HowItWorksDialog";
import { GrantList } from "@/components/AgentDashboard/Grants/GrantList";
import { WeekSelector } from "@/components/AgentDashboard/Grants/WeekSelector";
import { Label } from "@/components/shadcn/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";
import { useToast } from "@/components/shadcn/use-toast";
import { a0xAddress, usdcAddress } from "@/config/constants";
import type {
  Agent,
  BaseGrant,
  Grant,
  GrantStatus,
  GrantUrlAnalysis,
} from "@/types/agent.model";
import axios from "axios";
import { ExternalLinkIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { erc20Abi, formatUnits } from "viem";
import { base } from "viem/chains";
import { useReadContract } from "wagmi";

// Type Guard para diferenciar entre Grant y GrantUrlAnalysis
function isGrant(grant: BaseGrant): grant is Grant {
  return "projectName" in grant && "type" in grant;
}

function isGrantUrlAnalysis(grant: BaseGrant): grant is GrantUrlAnalysis {
  return "normalizedUrl" in grant && "url" in grant;
}

interface GrantManagerProps {
  grantsData: (Grant | GrantUrlAnalysis)[];
  agent: Agent;
}

export function GrantManagement({ grantsData, agent }: GrantManagerProps) {
  const [grants, setGrants] =
    useState<(Grant | GrantUrlAnalysis)[]>(grantsData);
  const [selectedGrant, setSelectedGrant] = useState<
    Grant | GrantUrlAnalysis | null
  >(null);

  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);

  const { toast } = useToast();

  const sendStatusUpdate = async (id: string, status: GrantStatus) => {
    try {
      const response = await axios.put(`/api/grants`, {
        agentId: agent.agentId,
        id,
        status,
      });
      if (response.status === 200) {
        toast({
          title: "Grant status updated",
          description: "The grant status has been updated",
          variant: "default",
          className:
            "bg-brand-primary/80 border border-brand-border backdrop-blur-sm text-white",
          duration: 3000,
        });
        setGrants(
          grants.map((grant) =>
            grant.id === id ? { ...grant, status } : grant
          )
        );
      } else {
        toast({
          title: "Error updating grant status",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating grant status:", error);
      toast({
        title: "Error updating grant status",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (id: string) => {
    setGrants(
      grants.map((grant) =>
        grant.id === id
          ? { ...grant, status: "approved" as GrantStatus }
          : grant
      )
    );
    await sendStatusUpdate(id, "approved");
  };

  const handleDeny = async (id: string) => {
    setGrants(
      grants.map((grant) =>
        grant.id === id ? { ...grant, status: "denied" as GrantStatus } : grant
      )
    );
    await sendStatusUpdate(id, "denied");
  };

  const handleReturnToPending = async (id: string) => {
    setGrants(
      grants.map((grant) =>
        grant.id === id ? { ...grant, status: "pending" as GrantStatus } : grant
      )
    );
    await sendStatusUpdate(id, "pending");
  };

  const handleSendGrant = async (id: string, amount: number) => {
    setIsProcessingTransaction(true);

    try {
      const response = await axios.post("/api/grants", {
        agentId: agent.agentId,
        id,
        amount: amount,
      });

      if (response.status === 200) {
        toast({
          title: "Grant sent",
          description: "The transaction has been initiated",
          variant: "default",
          className:
            "bg-brand-primary/80 border border-brand-border backdrop-blur-sm text-white",
          duration: 3000,
        });

        // Actualizar el estado local cuando la transacción se complete correctamente
        setGrants(
          grants.map((grant) =>
            grant.id === id
              ? { ...grant, status: "paid" as GrantStatus }
              : grant
          )
        );

        // Actualizar el saldo de USDC después de enviar la subvención
        refetchBalanceOfUSDC();
      } else {
        toast({
          title: "Error sending grant",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending grant:", error);
      toast({
        title: "Error sending grant",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessingTransaction(false);
    }
  };

  const updateGrantAmount = async (id: string, amount: number) => {
    const grant = grants.find((grant) => grant.id === id);
    if (grant?.grantAmountInUSDC === amount) {
      return { message: "Grant amount is the same" };
    }
    try {
      await axios.put(`/api/grants`, {
        agentId: agent.agentId,
        id,
        amount,
      });

      setGrants(
        grants.map((grant) =>
          grant.id === id ? { ...grant, grantAmountInUSDC: amount } : grant
        )
      );

      return { message: "Grant updated" };
    } catch (error) {
      console.error("Error updating grant amount:", error);
      throw error;
    }
  };

  // Función auxiliar para obtener la marca de tiempo cuando se manejan diferentes tipos
  const getGrantTimestamp = (grant: BaseGrant): Date => {
    if (isGrantUrlAnalysis(grant) && !grant.timestamp) {
      // Si es GrantUrlAnalysis y no tiene timestamp, usar lastUpdated
      return new Date((grant as GrantUrlAnalysis).lastUpdated);
    }
    return new Date(grant.timestamp);
  };

  // Filter grants by selected week
  const filteredByWeek = useMemo(() => {
    return selectedWeek === "all"
      ? grants
      : grants.filter((grant) => {
          // Extract components from the selectedWeek value: week1-3-2024
          const parts = selectedWeek.split("-");
          if (parts.length < 3) return false; // Skip if format is incorrect

          const weekPart = parts[0]; // "week1"
          const weekNumber = parseInt(weekPart.replace("week", ""));
          const month = parseInt(parts[1]);
          const year = parseInt(parts[2]);

          // Convert grant timestamp to a Date object
          const grantDate = getGrantTimestamp(grant);
          const grantYear = grantDate.getFullYear();
          const grantMonth = grantDate.getMonth();

          // Check if the grant belongs to the selected year and month
          if (grantYear !== year || grantMonth !== month) {
            return false;
          }

          // Calculate which week of the month this grant belongs to
          const dayOfMonth = grantDate.getDate();
          // Calculate week number (1-based) within the month
          // Week 1: days 1-7, Week 2: days 8-14, Week 3: days 15-21, Week 4: days 22-28, Week 5: days 29-31
          const grantWeekNumber = Math.ceil(dayOfMonth / 7);

          // Match if the grant's week number matches the selected week number
          return grantWeekNumber === weekNumber;
        });
  }, [grants, selectedWeek]);

  const { data: balanceOfUSDC, refetch: refetchBalanceOfUSDC } =
    useReadContract({
      address: usdcAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [agent.agentWallet.walletAddress as `0x${string}`],
      chainId: base.id,
      query: {
        enabled: !!agent.agentWallet.walletAddress,
      },
    });

  const formattedBalanceOfUSDC = formatUnits(balanceOfUSDC || BigInt(0), 6);

  const { data: balanceOfA0X, refetch: refetchBalanceOfA0X } = useReadContract({
    address: a0xAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [agent.agentWallet.walletAddress as `0x${string}`],
    chainId: base.id,
    query: {
      enabled: !!agent.agentWallet.walletAddress,
    },
  });

  const formattedBalanceOfA0X = formatUnits(balanceOfA0X || BigInt(0), 18);

  const [tabValueSelected, setTabValueSelected] = useState("pending");

  const [tabDetailSelected, setTabDetailSelected] = useState<
    "details" | "quality" | "repository" | "social" | "video" | "urlanalysis"
  >("details");

  // Para la función handleGrantSelected, aseguramos que solo los objetos Grant se manejen como tal
  const handleGrantSelected = (
    grant: Grant | GrantUrlAnalysis,
    tab?: "details" | "quality" | "repository" | "social"
  ) => {
    setSelectedGrant(grant);

    // Verificar que el grant sea del tipo Grant antes de usar características específicas
    if (tab && isGrant(grant)) {
      setTabDetailSelected(tab);
      setTimeout(() => {
        const detailsTab = document.getElementById(`details-tab-${grant.id}`);
        if (detailsTab) {
          detailsTab.scrollIntoView({ behavior: "smooth" });
          // Asegurar que el scroll completo llegue hasta el elemento
          window.scrollTo({
            top: window.scrollY + 300, // Ajustar el scroll para dejar un margen superior
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  return (
    <div className="space-y-6 relative">
      {isProcessingTransaction && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10 rounded-md">
          <div className="bg-white p-4 rounded-md shadow-md flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Processing transaction...</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-800">Grant Manager</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">How it works?</span>
          <HowItWorksDialog />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-md">
          Total Grants{" "}
          {tabValueSelected.charAt(0).toUpperCase() + tabValueSelected.slice(1)}{" "}
          {
            filteredByWeek.filter((grant) => grant.status === tabValueSelected)
              .length
          }
        </Label>

        <Label className="text-md flex items-center gap-2">
          {agent.name} balance {Number(formattedBalanceOfUSDC).toFixed(2)} USDC
          <Link
            href={`https://basescan.org/address/${agent.agentWallet.walletAddress}`}
            target="_blank"
            className="text-brand-primary"
          >
            <ExternalLinkIcon className="w-4 h-4" />
          </Link>
        </Label>
        <WeekSelector
          selectedWeek={selectedWeek}
          onSelectWeek={setSelectedWeek}
        />
      </div>

      <Tabs
        defaultValue={tabValueSelected}
        className="w-full"
        onValueChange={(value) => {
          setTabValueSelected(value);
        }}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="denied">Denied</TabsTrigger>
          <TabsTrigger value="paid">Granted</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        {agent.agentId && (
          <>
            <TabsContent value="pending">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Repository Grants
                  </h3>
                  <GrantList
                    grants={filteredByWeek.filter(
                      (grant) =>
                        grant.status === "pending" && !isGrantUrlAnalysis(grant)
                    )}
                    onSelect={handleGrantSelected}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    onUpdateAmount={updateGrantAmount}
                    onSendGrant={handleSendGrant}
                    selectedId={selectedGrant?.id}
                    agentId={agent.agentId}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">URL Grants</h3>
                  <GrantList
                    grants={filteredByWeek.filter(
                      (grant) =>
                        grant.status === "pending" && isGrantUrlAnalysis(grant)
                    )}
                    onSelect={handleGrantSelected}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    onUpdateAmount={updateGrantAmount}
                    onSendGrant={handleSendGrant}
                    selectedId={selectedGrant?.id}
                    agentId={agent.agentId}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="approved">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Repository Grants
                  </h3>
                  <GrantList
                    grants={filteredByWeek.filter(
                      (grant) =>
                        grant.status === "approved" &&
                        !isGrantUrlAnalysis(grant)
                    )}
                    onSelect={handleGrantSelected}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    onUpdateAmount={updateGrantAmount}
                    onSendGrant={handleSendGrant}
                    selectedId={selectedGrant?.id}
                    agentId={agent.agentId}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">URL Grants</h3>
                  <GrantList
                    grants={filteredByWeek.filter(
                      (grant) =>
                        grant.status === "approved" && isGrantUrlAnalysis(grant)
                    )}
                    onSelect={handleGrantSelected}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    onUpdateAmount={updateGrantAmount}
                    onSendGrant={handleSendGrant}
                    selectedId={selectedGrant?.id}
                    agentId={agent.agentId}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="denied">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Repository Grants
                  </h3>
                  <GrantList
                    grants={filteredByWeek.filter(
                      (grant) =>
                        grant.status === "denied" && !isGrantUrlAnalysis(grant)
                    )}
                    onSelect={handleGrantSelected}
                    onApprove={handleApprove}
                    onDeny={handleReturnToPending}
                    onUpdateAmount={updateGrantAmount}
                    onSendGrant={handleSendGrant}
                    selectedId={selectedGrant?.id}
                    agentId={agent.agentId}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">URL Grants</h3>
                  <GrantList
                    grants={filteredByWeek.filter(
                      (grant) =>
                        grant.status === "denied" && isGrantUrlAnalysis(grant)
                    )}
                    onSelect={handleGrantSelected}
                    onApprove={handleApprove}
                    onDeny={handleReturnToPending}
                    onUpdateAmount={updateGrantAmount}
                    onSendGrant={handleSendGrant}
                    selectedId={selectedGrant?.id}
                    agentId={agent.agentId}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="paid">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Repository Grants
                  </h3>
                  <GrantList
                    grants={filteredByWeek.filter(
                      (grant) =>
                        grant.status === "paid" && !isGrantUrlAnalysis(grant)
                    )}
                    onSelect={handleGrantSelected}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    onUpdateAmount={updateGrantAmount}
                    onSendGrant={handleSendGrant}
                    selectedId={selectedGrant?.id}
                    agentId={agent.agentId}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">URL Grants</h3>
                  <GrantList
                    grants={filteredByWeek.filter(
                      (grant) =>
                        grant.status === "paid" && isGrantUrlAnalysis(grant)
                    )}
                    onSelect={handleGrantSelected}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    onUpdateAmount={updateGrantAmount}
                    onSendGrant={handleSendGrant}
                    selectedId={selectedGrant?.id}
                    agentId={agent.agentId}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="all">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Repository Grants
                  </h3>
                  <GrantList
                    grants={filteredByWeek.filter(
                      (grant) => !isGrantUrlAnalysis(grant)
                    )}
                    onSelect={handleGrantSelected}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    onUpdateAmount={updateGrantAmount}
                    onSendGrant={handleSendGrant}
                    selectedId={selectedGrant?.id}
                    agentId={agent.agentId}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">URL Grants</h3>
                  <GrantList
                    grants={filteredByWeek.filter((grant) =>
                      isGrantUrlAnalysis(grant)
                    )}
                    onSelect={handleGrantSelected}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    onUpdateAmount={updateGrantAmount}
                    onSendGrant={handleSendGrant}
                    selectedId={selectedGrant?.id}
                    agentId={agent.agentId}
                  />
                </div>
              </div>
            </TabsContent>
          </>
        )}

        {selectedGrant && (
          <div className="mt-6">
            <GrantDetail
              grant={selectedGrant}
              onApprove={handleApprove}
              onDeny={handleDeny}
              tabDetailSelected={tabDetailSelected}
              setTabDetailSelected={setTabDetailSelected}
            />
          </div>
        )}
      </Tabs>
    </div>
  );
}
