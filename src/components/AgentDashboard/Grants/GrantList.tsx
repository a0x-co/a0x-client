"use client";

import type { BaseGrant, Grant, GrantUrlAnalysis } from "@/types/agent.model";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import {
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  Plus,
  Minus,
  Pencil,
  Loader2,
  Send,
  MessageCircle,
  Info,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/shadcn/use-toast";
import axios from "axios";

interface GrantListProps {
  grants: (Grant | GrantUrlAnalysis)[];
  onSelect: (
    grant: Grant | GrantUrlAnalysis,
    tab?: "details" | "quality" | "repository" | "social"
  ) => void;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  onUpdateAmount?: (id: string, newAmount: number) => void;
  onSendGrant?: (id: string, amount: number) => void;
  selectedId?: string;
  agentId: string;
}

// La función auxiliar para verificar el tipo de grant debe ser más específica
const isGrantUrlAnalysis = (
  grant: Grant | GrantUrlAnalysis
): grant is GrantUrlAnalysis => {
  return "urlAnalysis" in grant && !("metrics" in grant);
};

export function GrantList({
  grants,
  onSelect,
  onApprove,
  onDeny,
  onUpdateAmount,
  onSendGrant,
  selectedId,
  agentId,
}: GrantListProps) {
  const [editingGrantId, setEditingGrantId] = useState<string | null>(null);
  const [editedAmount, setEditedAmount] = useState<number>(0);
  const [grantsData, setGrantsData] =
    useState<(Grant | GrantUrlAnalysis)[]>(grants);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingGrantId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingGrantId]);

  useEffect(() => {
    setGrantsData(grants);
  }, [grants]);

  const handleStartEdit = (
    e: React.MouseEvent,
    grant: Grant | GrantUrlAnalysis
  ) => {
    e.stopPropagation();
    setEditingGrantId(grant.id);
    setEditedAmount(grant.grantAmountInUSDC || 0);
  };

  const { toast } = useToast();

  const handleSaveEdit = async (id: string) => {
    setGrantsData((prevGrants) =>
      prevGrants.map((grant) =>
        grant.id === id ? { ...grant, grantAmountInUSDC: editedAmount } : grant
      )
    );

    const grant = grantsData.find((grant) => grant.id === id);

    if (editedAmount === grant?.grantAmountInUSDC) {
      return;
    }

    if (onUpdateAmount) {
      onUpdateAmount(id, editedAmount);
    }

    setIsLoading(true);
    setLoadingAction("updating");

    try {
      const response = await updateGrantAmount(id, editedAmount);
      if (response?.message === "Grant updated") {
        toast({
          title: "Grant amount updated",
          description: "The grant amount has been updated",
          variant: "default",
          className:
            "bg-brand-primary/80 border border-brand-border backdrop-blur-sm text-white",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error updating grant amount",
          description: "Please try again",
        });
        setGrantsData((prevGrants) =>
          prevGrants.map((grant) =>
            grant.id === id
              ? { ...grant, grantAmountInUSDC: grant.grantAmountInUSDC }
              : grant
          )
        );
      }
    } catch (error) {
      console.error("Error updating grant amount:", error);
      toast({
        title: "Error updating grant amount",
        description: "Please try again",
        variant: "destructive",
        duration: 3000,
      });
      setGrantsData((prevGrants) =>
        prevGrants.map((grant) =>
          grant.id === id
            ? { ...grant, grantAmountInUSDC: grant.grantAmountInUSDC }
            : grant
        )
      );
    } finally {
      setIsLoading(false);
      setLoadingAction("");
      setEditingGrantId(null);
    }
  };

  const updateGrantAmount = async (
    id: string,
    amount: number
  ): Promise<any> => {
    try {
      const response = await axios.put(`/api/grants`, {
        agentId,
        id,
        amount,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating grant amount:", error);
      throw error;
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.replace(/,/g, ""));
    if (!isNaN(value)) {
      setEditedAmount(value);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedAmount((prev) => prev + 10);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedAmount((prev) => Math.max(0, prev - 10));
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (editingGrantId) {
      handleSaveEdit(editingGrantId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && editingGrantId) {
      handleSaveEdit(editingGrantId);
    }
  };

  const handleSendGrant = async (
    e: React.MouseEvent,
    id: string,
    amount: number
  ) => {
    e.stopPropagation();
    setIsLoading(true);
    setLoadingAction("sending");

    try {
      if (onSendGrant) {
        onSendGrant(id, amount);
      }

      toast({
        title: "Sending grant",
        description: "The transaction is being processed",
        variant: "default",
        className:
          "bg-emerald-500/80 border border-emerald-500 backdrop-blur-sm text-white",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error sending grant:", error);
      toast({
        title: "Error sending grant",
        description: "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setLoadingAction("");
    }
  };

  return (
    <div className="rounded-md border">
      {isLoading && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10 rounded-md">
          <div className="bg-white p-4 rounded-md shadow-md flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>
              {loadingAction === "updating"
                ? "Updating amount..."
                : loadingAction === "sending"
                ? "Sending grant..."
                : "Processing..."}
            </span>
          </div>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Amount to Grant (USDC)</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="hidden md:table-cell">Rating</TableHead>
            <TableHead className="hidden md:table-cell">Contributors</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grantsData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-6 text-muted-foreground"
              >
                No grants found
              </TableCell>
            </TableRow>
          ) : (
            grantsData.map((grant) => (
              <TableRow
                key={grant.id}
                className={
                  selectedId === grant.id ? "bg-gray-50" : "hover:bg-gray-50"
                }
                onClick={() => onSelect(grant, undefined)}
              >
                <TableCell className="font-medium">
                  <div className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      {isGrantUrlAnalysis(grant) ? (
                        <>
                          {grant?.url || "URL Project"}
                          <span className="text-xs text-blue-500 inline-flex items-center">
                            <Info className="h-3 w-3 ml-1" />
                            <span className="ml-1">URL</span>
                          </span>
                        </>
                      ) : (
                        grant.metrics?.repository?.fullName
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {isGrantUrlAnalysis(grant)
                        ? grant.urlAnalysis?.analysis?.summary?.substring(
                            0,
                            60
                          ) || grant.url
                        : grant.metrics?.repository?.description?.substring(
                            0,
                            60
                          ) ||
                          grant.metrics?.repository?.descriptionFromAnalysis?.substring(
                            0,
                            60
                          )}
                      ...
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {editingGrantId === grant.id ? (
                    <div
                      className="flex items-center space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleDecrement}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <input
                        ref={inputRef}
                        type="text"
                        value={editedAmount.toLocaleString()}
                        onChange={handleAmountChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="w-20 text-center border rounded p-1"
                        onFocus={(e) => e.target.select()}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleIncrement}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer text-center flex items-center justify-center gap-2"
                      onClick={(e) => handleStartEdit(e, grant)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        data-name="86977684-12db-4850-8f30-233a7c267d11"
                        viewBox="0 0 2000 2000"
                        className="w-4 h-4"
                      >
                        <path
                          d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z"
                          fill="#2775ca"
                        />
                        <path
                          d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z"
                          fill="#fff"
                        />
                        <path
                          d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z"
                          fill="#fff"
                        />
                      </svg>
                      {grant.grantAmountInUSDC !== undefined &&
                      grant.grantAmountInUSDC !== null
                        ? grant.grantAmountInUSDC.toLocaleString()
                        : "0"}
                      {grant.status !== "paid" && (
                        <button
                          onClick={(e) => handleStartEdit(e, grant)}
                          className="text-muted-foreground hover:text-primary ml-6"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(grant.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => {
                      let scorePonderation = 0;

                      if (isGrantUrlAnalysis(grant)) {
                        // Para grants con urlAnalysis, usa relevanceScore como puntuación
                        const relevanceScore =
                          grant.urlAnalysis?.analysis?.relevanceScore || 0;
                        scorePonderation = (relevanceScore / 100) * 5; // Asumiendo que relevanceScore es de 0-100
                      } else if (grant.metrics?.repository?.quality) {
                        // Para grants con metrics, calcula como antes
                        const metrics = [
                          grant.metrics.repository.quality.web3Score?.score,
                          grant.metrics.repository.quality.activityScore?.score,
                          grant.metrics.repository.quality.documentationQuality
                            ?.score,
                          grant.metrics.repository.quality.codeQuality?.score,
                          grant.metrics.repository.quality.securityScore?.score,
                          grant.metrics.repository.quality.architectureScore
                            ?.score,
                        ];

                        const validMetrics = metrics.filter(
                          (metric) => metric !== null && metric !== undefined
                        );

                        if (validMetrics.length > 0) {
                          const sum = validMetrics.reduce(
                            (acc, score) => acc + score,
                            0
                          );
                          scorePonderation = (sum / validMetrics.length) * 5;
                        }
                      }

                      return (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < scorePonderation
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {isGrantUrlAnalysis(grant)
                    ? "-"
                    : grant.metrics?.repository?.contributors
                        ?.totalContributors || "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      grant.status === "approved"
                        ? "success"
                        : grant.status === "denied"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {grant.status.charAt(0).toUpperCase() +
                      grant.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {grant.status !== "paid" && (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            grant.walletAddress ||
                            (grant.walletAddresses &&
                              grant.walletAddresses.length > 0)
                          ) {
                            handleSendGrant(
                              e,
                              grant.id,
                              grant.grantAmountInUSDC || 0
                            );
                          } else {
                            onSelect(grant, "social");
                          }
                        }}
                        className="h-8 w-max px-2 gap-2 flex items-center justify-center hover:bg-cyan-50/50 transition-all duration-300"
                      >
                        {grant.walletAddress ||
                        (grant.walletAddresses &&
                          grant.walletAddresses.length > 0)
                          ? "Send Grant"
                          : "Request Wallet"}
                        {grant.walletAddress ||
                        (grant.walletAddresses &&
                          grant.walletAddresses.length > 0) ? (
                          <Send className="h-4 w-4 text-blue-500" />
                        ) : (
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onApprove(grant.id);
                        }}
                        className="h-8 w-8"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="sr-only">Approve</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeny(grant.id);
                        }}
                        className="h-8 w-8"
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Deny</span>
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
