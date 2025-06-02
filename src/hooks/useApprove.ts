import { useEffect, useRef } from "react";
import { erc20Abi, getAddress, zeroAddress } from "viem";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

// Hook for approving token spending
export const useApprove = (
  _tokenAddress: `0x${string}`,
  _tokenSymbol: string,
  swapAddress: `0x${string}`,
  tokenNeedsApproval: boolean,
  amountSpend: bigint,
  callback?: () => void
) => {
  const { chainId } = useAccount();

  // Ensure the token address is valid, use zero address if not provided
  const tokenAddress = getAddress(_tokenAddress ? _tokenAddress : zeroAddress);

  // Prepare the approval transaction
  const simulate = useSimulateContract({
    address: tokenAddress,
    chainId: chainId,
    abi: erc20Abi,
    functionName: "approve",
    args: [swapAddress, amountSpend],
    query: {
      enabled: tokenNeedsApproval && tokenAddress !== zeroAddress,
    },
  });

  // Hook for writing the contract (sending the transaction)
  const write = useWriteContract();

  // Wait for the transaction receipt after sending
  const wait = useWaitForTransactionReceipt({
    hash: write.data,
    query: {
      meta: {
        successMessage: `Successfully approved ${_tokenSymbol}`,
      },
    },
  });

  const callbackExecuted = useRef(false);
  const lastTransactionHash = useRef<`0x${string}` | undefined>(undefined);

  useEffect(() => {
    if (write.data && write.data !== lastTransactionHash.current) {
      lastTransactionHash.current = write.data;
      callbackExecuted.current = false;
    }
    if (wait.isSuccess && callback && !callbackExecuted.current) {
      callback();
      callbackExecuted.current = true;
    }
  }, [wait.isSuccess, callback, write.data]);

  return {
    write,
    isLoading: write.isPending || wait.isLoading,
    simulate,
    wait,
  };
};
