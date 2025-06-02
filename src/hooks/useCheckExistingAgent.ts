// react
import { useCallback, useEffect, useRef, useState } from "react";

// axios
import axios from "axios";

// types
import { Agent } from "@/types";

// wagmi
import { useAccount } from "wagmi";

export function useCheckExistingAgent(
  isMounted: boolean,
  isConnected: boolean
) {
  const hasChecked = useRef<string | null>(null);
  const [agentExists, setAgentExists] = useState(false);
  const { address } = useAccount();
  const [agents, setAgents] = useState<Agent[] | null>(null);

  const checkExistingAgent = useCallback(async () => {
    try {
      if (!address) {
        console.log("No address");
        return;
      }
      const lowercasedAddress = address.toLowerCase();
      const response = await axios.get(
        `/api/agents?address=${lowercasedAddress}`
      );
      if (response.status === 200 && response.data) {
        setAgentExists(true);
        setAgents(response.data);
      }
      console.log(response.data);
      hasChecked.current = lowercasedAddress || null;
    } catch (error) {
      console.error("Error al verificar el agente existente:", error);
    }
  }, [address]);

  useEffect(() => {
    if (
      isMounted &&
      isConnected &&
      address &&
      hasChecked.current !== address.toLowerCase()
    ) {
      checkExistingAgent();
    }
    if (!address || !isConnected) {
      setAgentExists(false);
      setAgents(null);
    }
  }, [isMounted, isConnected, address, checkExistingAgent]);

  return {
    agentExists,
    agents,
    refetch: checkExistingAgent,
  };
}
