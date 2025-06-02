// privy
import {
  usePrivy,
  useSendTransaction as useSendTransactionPrivy,
  useWallets,
} from "@privy-io/react-auth";

// react
import { useEffect, useState } from "react";

// components
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { Progress } from "@/components/shadcn/progress";

// icons
import { Clock, Loader2, RefreshCcw, Zap } from "lucide-react";

// viem & wagmi
import {
  a0xLifeAgentExtenderABI,
  a0xLifeContractAddress,
  usdcAddress,
  a0xAddress,
} from "@/config/constants";
import { ethers } from "ethers";
import { encodeFunctionData, erc20Abi, formatUnits } from "viem";
import { base } from "viem/chains";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

// toast
import { useToast } from "@/components/shadcn/use-toast";

// types
import { useApprove } from "@/hooks/useApprove";
import { Agent } from "@/types";
import { cn } from "@/lib/utils";

// ABI for ERC20 token operations
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
];

interface AgentLifeBarProps {
  agent: Agent;
  refetchAgent: () => void;
}

export function AgentLifeBar({ agent, refetchAgent }: AgentLifeBarProps) {
  // ---------- STATE MANAGEMENT ----------
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingExtend, setLoadingExtend] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedToken, setSelectedToken] = useState<"USDC" | "A0X">("USDC");
  const { toast } = useToast();

  // ---------- WALLET CONNECTIONS --------
  const { sendTransaction: sendTransactionPrivy } = useSendTransactionPrivy();
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const { address } = useAccount();

  // ---------- AGENT LIFE DATA -----------
  const daysToDie = new Date(agent.life.expirationTime).getTime() - Date.now();
  const lifePercentage = (daysToDie / (30 * 24 * 60 * 60 * 1000)) * 100;

  // ---------- PAYMENT CONSTANTS ---------
  // Minimum approval amount - 10 USDC
  const MIN_APPROVAL_AMOUNT = "10";
  const minApprovalAmountDecimal = ethers.parseUnits(MIN_APPROVAL_AMOUNT, 6);

  // Payment amount based on selected days
  const amountInUSDC =
    selectedDays === 7 ? "1" : selectedDays === 14 ? "2" : "4";
  const amountInDecimal = ethers.parseUnits(amountInUSDC, 6);
  // const amountInDecimal = ethers.parseUnits(amountInUSDC, 3);

  // ---------- BLOCKCHAIN QUERIES --------
  // Check USDC allowance
  const {
    data: allowanceData,
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance,
  } = useReadContract({
    address:
      selectedToken === "USDC" ? usdcAddress : (a0xAddress as `0x${string}`),
    abi: erc20Abi,
    functionName: "allowance",
    args: [address as `0x${string}`, a0xLifeContractAddress as `0x${string}`],
    chainId: base.id,
    query: {
      enabled: !!address && isPaymentModalOpen,
    },
  });

  // Check USDC balance
  const { data: balanceOfUSDC, refetch: refetchBalanceOfUSDC } =
    useReadContract({
      address: usdcAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
      chainId: base.id,
      query: {
        enabled: !!address && isPaymentModalOpen,
      },
    });

  // Check A0X balance
  const { data: balanceOfA0X, refetch: refetchBalanceOfA0X } = useReadContract({
    address: a0xAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    chainId: base.id,
    query: {
      enabled: !!address && isPaymentModalOpen,
    },
  });

  // Get A0X amount for USDC
  const { data: a0xAmount, refetch: refetchA0xAmount } = useReadContract({
    address: a0xLifeContractAddress as `0x${string}`,
    abi: a0xLifeAgentExtenderABI,
    functionName: "getA0XAmountForUSDC",
    args: [amountInDecimal],
    chainId: base.id,
    query: {
      enabled: !!address && isPaymentModalOpen && selectedToken === "A0X",
    },
  }) as { data: bigint | undefined; refetch: () => void };

  // Format values for display
  const formattedBalanceOfUSDC = formatUnits(balanceOfUSDC || BigInt(0), 6);
  const formattedBalanceOfA0X = Number(
    formatUnits(balanceOfA0X || BigInt(0), 18)
  ).toFixed(2);
  const formattedA0xAmount = a0xAmount
    ? Number(formatUnits(a0xAmount, 18)).toFixed(2)
    : "0";
  const a0xAmountBigInt = a0xAmount || BigInt(0);

  const isEnoughBalance =
    selectedToken === "USDC"
      ? Number(formattedBalanceOfUSDC) >= Number(amountInUSDC)
      : Number(formattedBalanceOfA0X) >= Number(formattedA0xAmount);

  // ---------- EXTEND LIFE TRANSACTION -------
  const {
    writeContract: writeExtendLife,
    data: extendLifeData,
    isPending: isPendingExtendLife,
  } = useWriteContract();
  const wait = useWaitForTransactionReceipt({
    hash: extendLifeData,
    query: {
      meta: {
        successMessage: `Successfully extended life`,
      },
    },
  });
  const isLoadingExtendLife = isPendingExtendLife || wait.isLoading;

  useEffect(() => {
    if (wait.isSuccess) {
      toast({
        title: "Life extended",
        description: `Agent life extended by ${selectedDays} days`,
      });
      refetchAgent();
      refetchAllowance();
      refetchBalanceOfUSDC();
      refetchBalanceOfA0X();
    }
  }, [
    wait.isSuccess,
    refetchAgent,
    refetchAllowance,
    selectedDays,
    toast,
    refetchBalanceOfUSDC,
    refetchBalanceOfA0X,
  ]);

  // ---------- APPROVE TRANSACTION -------
  const {
    write: writeApprove,
    isLoading: isLoadingApprove,
    simulate: simulateApprove,
  } = useApprove(
    selectedToken === "USDC" ? usdcAddress : (a0xAddress as `0x${string}`),
    selectedToken,
    a0xLifeContractAddress as `0x${string}`,
    true,
    selectedToken === "USDC" ? amountInDecimal : a0xAmountBigInt,
    async () => {
      console.log("Approved");
      refetchAllowance();
    }
  );

  // Check if allowance is sufficient for transaction
  const allowance = allowanceData || BigInt(0);
  const isSufficientAllowance =
    selectedToken === "USDC"
      ? allowance >= amountInDecimal
      : allowance >= a0xAmountBigInt;

  // ---------- EFFECTS ------------------
  // Refresh allowance when modal opens or days change
  useEffect(() => {
    if (isPaymentModalOpen && address) {
      refetchAllowance();
    }
  }, [isPaymentModalOpen, selectedDays, address, refetchAllowance]);

  // ---------- EVENT HANDLERS -----------
  // Handle USDC approval
  const handleApprove = async () => {
    setLoadingApprove(true);

    try {
      await wallet.switchChain(base.id);

      // Prepare approval data
      const usdcInterface = new ethers.Interface(ERC20_ABI);
      const approveDataPrivy = usdcInterface.encodeFunctionData("approve", [
        a0xLifeContractAddress,
        selectedToken === "USDC" ? minApprovalAmountDecimal : a0xAmountBigInt,
      ]);
      const approveDataWagmi = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [
          a0xLifeContractAddress,
          selectedToken === "USDC" ? minApprovalAmountDecimal : a0xAmountBigInt,
        ],
      });

      if (!user) {
        console.error("No user found");
        return;
      }

      // Execute transaction based on wallet type
      let tx;
      if (user.wallet && user.wallet.walletClientType !== "privy") {
        if (simulateApprove.data?.request != null) {
          writeApprove?.writeContract(simulateApprove?.data?.request);
        }
        console.log(
          "Sending approval transaction with wagmi",
          approveDataWagmi
        );
      } else {
        tx = await sendTransactionPrivy(
          {
            to:
              selectedToken === "USDC"
                ? usdcAddress
                : (a0xAddress as `0x${string}`),
            value: 0,
            data: approveDataPrivy as `0x${string}`,
            chainId: base.id,
          },
          {
            uiOptions: { showWalletUIs: true },
            fundWalletConfig: {
              amount: MIN_APPROVAL_AMOUNT,
              asset: {
                erc20:
                  selectedToken === "USDC"
                    ? usdcAddress
                    : (a0xAddress as `0x${string}`),
              },
              card: { preferredProvider: "moonpay" },
            },
          }
        );
        console.log("Approval transaction sent:", tx?.hash);
      }

      // Refresh allowance after a delay
      setTimeout(() => {
        refetchAllowance();
        refetchBalanceOfUSDC();
        refetchBalanceOfA0X();
      }, 2000);
    } catch (error) {
      console.error("Error processing approval:", error);
    } finally {
      setLoadingApprove(false);
    }
  };

  // Handle extending agent life
  const handleExtendLife = async () => {
    setLoadingExtend(true);

    try {
      await wallet.switchChain(base.id);
      // Prepare extend life data
      const a0xLifeInterface = new ethers.Interface(a0xLifeAgentExtenderABI);
      const extendLifeDataPrivy = a0xLifeInterface.encodeFunctionData(
        "extendLife",
        [agent.agentId, amountInDecimal, selectedToken === "USDC"]
      );

      if (!user) {
        console.error("No user found");
        return;
      }

      let tx;
      if (user.wallet && user.wallet.walletClientType !== "privy") {
        console.log("Writing extend life transaction with wagmi", user.wallet);
        tx = await writeExtendLife({
          address: a0xLifeContractAddress,
          abi: a0xLifeAgentExtenderABI,
          functionName: "extendLife",
          args: [agent.agentId, amountInDecimal, selectedToken === "USDC"],
          chainId: base.id,
          gas: BigInt(500000),
        });
      } else {
        tx = await sendTransactionPrivy({
          to: a0xLifeContractAddress,
          data: extendLifeDataPrivy as `0x${string}`,
          chainId: base.id,
        });
      }

      console.log("Extend life transaction sent:", tx);

      // Refresh allowance after a delay
      setTimeout(() => {
        refetchAgent();
        refetchAllowance();
        refetchBalanceOfUSDC();
        refetchBalanceOfA0X();
      }, 2000);
    } catch (error) {
      console.error("Error extending agent life:", error);
    } finally {
      setLoadingExtend(false);
      refetchBalanceOfUSDC();
      refetchBalanceOfA0X();
    }
  };

  // ---------- COMPONENT RENDERING -------
  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Agent Life Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium text-gray-900">
            Agent Lifespan
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPaymentModalOpen(true)}
          disabled={loadingApprove || loadingExtend}
          className="flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full px-4 py-2 border border-indigo-700/20 shadow-[0px_4px_8px_0px_rgba(17,18,35,0.25)] hover:from-indigo-500/80 hover:to-indigo-700/80 transition-all duration-200 neon-glow disabled:opacity-50 border-none"
        >
          <Zap className="h-4 w-4" />
          {loadingApprove || loadingExtend ? "Processing..." : "Extend Life"}
        </Button>
      </div>

      {/* Life Progress Bar */}
      <div className="space-y-2">
        <Progress value={lifePercentage} className="h-2" />
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {daysToDie > 0 ? (daysToDie / (24 * 60 * 60 * 1000)).toFixed(0) : 0}{" "}
            days remaining
          </span>
          <span>30 days | 1 month</span>
        </div>
      </div>

      {/* Extend Life Dialog */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Extend Agent Lifespan</DialogTitle>
            <DialogDescription>
              Select how many days you want to add to your agent&apos;s life (1
              unit = 1 day).
            </DialogDescription>
          </DialogHeader>

          {/* Token Selection */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium">Payment Method:</span>
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedToken("USDC")}
                className={cn(
                  "flex items-center gap-2",
                  selectedToken === "USDC" &&
                    "bg-indigo-600 hover:bg-indigo-700 text-white"
                )}
              >
                USDC
              </Button>
              <Button
                onClick={() => setSelectedToken("A0X")}
                className={cn(
                  "flex items-center gap-2",
                  selectedToken === "A0X" &&
                    "bg-indigo-600 hover:bg-indigo-700 text-white"
                )}
              >
                A0X
              </Button>
            </div>
          </div>

          {/* Days Selection */}
          <div className="grid grid-cols-3 gap-4 py-4">
            {[7, 14, 30].map((days) => (
              <Button
                key={days}
                variant={selectedDays === days ? "default" : "outline"}
                onClick={() => {
                  setSelectedDays(days);
                  refetchAllowance();
                }}
                className={`flex flex-col items-center gap-2 p-4 h-auto ${
                  selectedDays === days
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <span className="text-2xl font-bold">{days}</span>
                <span className="text-sm">days</span>
                <span className="text-sm">
                  {days === 7 ? "1" : days === 14 ? "2" : "4"} USDC
                </span>
              </Button>
            ))}
          </div>

          {/* Balance Information */}
          <div className="mt-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Current balance:</span>
              <span>
                {selectedToken === "USDC"
                  ? `${formattedBalanceOfUSDC} USDC`
                  : `${formattedBalanceOfA0X} A0X`}
              </span>
              {isEnoughBalance ? (
                <span className="text-green-600">(Sufficient ✓)</span>
              ) : (
                <span className="text-amber-600">(Insufficient)</span>
              )}
              <button
                onClick={() => {
                  if (selectedToken === "USDC") {
                    refetchBalanceOfUSDC();
                  } else {
                    refetchBalanceOfA0X();
                  }
                }}
                className="active:scale-95 active:rotate-180 transition-all duration-200"
              >
                <RefreshCcw className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Current allowance:</span>
              {isLoadingAllowance ? (
                <span>Verifying...</span>
              ) : (
                <span>
                  {selectedToken === "USDC"
                    ? `${Number(formatUnits(allowance, 6)).toFixed(2)} USDC`
                    : `${Number(formatUnits(allowance, 18)).toFixed(2)} A0X`}
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {isSufficientAllowance
                ? "You have enough permission to perform this transaction."
                : "You need to approve the contract to spend your tokens."}
            </div>
          </div>

          {/* Action Buttons */}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Cancel
            </Button>

            {!isSufficientAllowance && (
              <Button
                onClick={handleApprove}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={isLoadingApprove || isLoadingAllowance}
              >
                {isLoadingApprove
                  ? "Approving..."
                  : isLoadingAllowance
                  ? "Verifying..."
                  : `1. Approve ${
                      selectedToken === "USDC"
                        ? MIN_APPROVAL_AMOUNT
                        : formattedA0xAmount
                    } ${selectedToken}`}
              </Button>
            )}

            <Button
              onClick={handleExtendLife}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={
                isLoadingExtendLife || !isEnoughBalance || isLoadingAllowance
              }
            >
              {isLoadingExtendLife ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extending Life
                </div>
              ) : !isEnoughBalance ? (
                "Insufficient balance"
              ) : (
                `${
                  isEnoughBalance ? "" : "2. "
                }Extend life ${selectedDays} days`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
