// react
import { useEffect, useRef } from "react";

// wagmi
import { erc20Abi, getAddress, zeroAddress } from "viem";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export const useTransfer = (
  _contractAddress: `0x${string}`,
  _amount: bigint,
  _to: `0x${string}`,
  refetch: boolean = false,
  onSuccess?: (txHash: `0x${string}`) => void
) => {
  const { chainId } = useAccount();

  const contractAddress = getAddress(
    _contractAddress ? _contractAddress : zeroAddress
  );

  const simulate = useSimulateContract({
    address: contractAddress,
    chainId: chainId,
    abi: erc20Abi,
    functionName: "transfer",
    args: [_to, _amount],
    query: {
      enabled: _amount > 0 && refetch,
    },
  });

  const write = useWriteContract();

  const wait = useWaitForTransactionReceipt({
    hash: write.data,
    query: {
      meta: {
        successMessage: `Successfully transferred`,
      },
    },
  });

  const onSuccessExecuted = useRef(false);
  const lastTransactionHash = useRef<`0x${string}` | undefined>(undefined);

  useEffect(() => {
    if (write.data && write.data !== lastTransactionHash.current) {
      lastTransactionHash.current = write.data;
      onSuccessExecuted.current = false;
    }
    if (
      wait.isSuccess &&
      onSuccess &&
      !onSuccessExecuted.current &&
      write.data
    ) {
      onSuccess(write.data);
      onSuccessExecuted.current = true;
    }
  }, [wait.isSuccess, onSuccess, write.data]);

  return {
    simulate,
    isLoading: wait.isLoading,
    write,
    wait,
  };
};
