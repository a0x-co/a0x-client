// react
import { useEffect, useRef } from "react";

// abi
// constants
import {
  a0xLifeAgentExtenderABI,
  a0xLifeContractAddress,
} from "@/config/constants";

// wagmi
import { getAddress } from "viem";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export const useExtendLife = (
  _amount: bigint,
  _agentId: string,
  onSuccess?: () => void,
  refetch: boolean = false
) => {
  const { chainId } = useAccount();

  const contractAddress = getAddress(a0xLifeContractAddress);

  const simulate = useSimulateContract({
    address: contractAddress,
    chainId: chainId,
    abi: a0xLifeAgentExtenderABI,
    functionName: "extendLife",
    args: [_agentId, _amount],
    query: {
      enabled: _amount > 0 && refetch,
    },
  });

  console.log("simulate", simulate);

  const write = useWriteContract();

  const wait = useWaitForTransactionReceipt({
    hash: write.data,
    query: {
      meta: {
        successMessage: `Successfully extended life`,
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
    if (wait.isSuccess && onSuccess && !onSuccessExecuted.current) {
      onSuccess();
      onSuccessExecuted.current = true;
    }
  }, [wait.isSuccess, onSuccess, write.data]);

  return {
    simulate,
    isLoading:
      write.isPending ||
      wait.isLoading ||
      (simulate.isPending && !simulate.isFetched),
    write,
    wait,
  };
};
