// react
import React, { useCallback, useEffect, useRef, useState } from "react";

// axios
import axios from "axios";

// utils
import { cn } from "@/lib/utils";

// auth
import { signIn, signOut, useSession } from "next-auth/react";

// query
import { useQuery } from "@tanstack/react-query";

// icons
import { FaXTwitter } from "react-icons/fa6";
import { LogOut, MessageSquare } from "lucide-react";

// types
import { Agent, AgentType } from "@/types";

interface Account {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  username: string;
}

interface ConnectTwitterCardProps {
  userAddress: string;
  agent: Agent;
  onConnect: () => void;
  onDesactivate: () => void;
  isConnectActive: boolean;
  isConnectSuccess: boolean;
  setConnectSuccess: (success: boolean) => void;
  handleChatWithAgent: (agentType: AgentType) => void;
  sendAuthToken: React.MutableRefObject<boolean>;
}

export const ConnectTwitterCard = ({
  userAddress,
  agent,
  onConnect,
  onDesactivate,
  isConnectActive,
  isConnectSuccess,
  setConnectSuccess,
  handleChatWithAgent,
  sendAuthToken,
}: ConnectTwitterCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { data: session } = useSession();

  const { data: account } = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/cookies");
        const data = await response.json();
        return data.account;
      } catch (error) {
        console.error("Error to get the account:", error);
        return null;
      }
    },
  });

  const hasSendTwitterRequest = useRef(false);
  const isTwitterConnected = useRef(false);

  useEffect(() => {
    if (
      session?.user?.name &&
      session?.user?.image &&
      !isTwitterConnected.current
    ) {
      setIsLoading(false);
      setConnectSuccess(true);
      const timeout = setTimeout(() => {
        onDesactivate();
        setConnectSuccess(false);
        isTwitterConnected.current = true;
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [session, setConnectSuccess, onDesactivate]);

  const handleRedeployAgent = useCallback(async () => {
    if (agent.connectedWith && agent.connectedWith.length > 0) {
      return;
    }
    try {
      const response = await axios.post("/api/redeploy-agent", {
        agentName: agent.name,
        username: account?.username,
      });
    } catch (error) {
      console.error("Error to redeploy agent:", error);
    }
  }, [agent.name, account, agent.connectedWith]);

  const handleSendTwitterRequest = useCallback(async () => {
    try {
      const response = await axios.post("/api/twitter", {
        username: account?.username,
        userAddress,
        accessToken: account?.accessToken,
        refreshToken: account?.refreshToken,
        imageUrl: session?.user?.image,
        name: session?.user?.name,
      });
      if (response.status === 200) {
        hasSendTwitterRequest.current = true;
        sendAuthToken.current = true;
        handleRedeployAgent();
      }
      console.log("[ConnectTwitterCard] response", response);
    } catch (error) {
      console.error("Error to connect with Twitter:", error);
    } finally {
      setTimeout(() => {
        onDesactivate();
        setConnectSuccess(false);
      }, 10000);
    }
  }, [
    account,
    session,
    userAddress,
    handleRedeployAgent,
    sendAuthToken,
    onDesactivate,
    setConnectSuccess,
  ]);

  const handleConnect = async () => {
    setIsLoading(true);
    onConnect();
    try {
      signIn("twitter", {
        callbackUrl: `/agent/${agent.name}?connectTwitter=true`,
      });
    } catch (error) {
      console.error("Error to connect with Twitter:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnectSuccess(false);
    setIsLoading(true);
    signOut({
      callbackUrl: `/agent/${agent.name}`,
    });
  };

  useEffect(() => {
    const maxAttempts = 3;
    let attempts = 0;
    const intervalId = setInterval(() => {
      if (attempts >= maxAttempts) {
        console.error("Could not connect with Twitter after 3 attempts.");
        clearInterval(intervalId);
        return;
      }
      if (!hasSendTwitterRequest.current && account && session && userAddress) {
        handleSendTwitterRequest();
        attempts++;
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [
    setConnectSuccess,
    account,
    handleSendTwitterRequest,
    session,
    userAddress,
  ]);

  if (isConnectSuccess) {
    return (
      <div className="absolute -top-24 left-0 w-full p-4 rounded-lg bg-gradient-to-r from-purple-400/90 to-purple-400/90 border border-purple-400 opacity-100 shadow-[0_0_15px_rgba(192,132,252,0.2)] hover:shadow-[0_0_20px_rgba(192,132,252,0.4)]">
        <div className="flex items-center gap-2">
          <FaXTwitter className="w-5 h-5 text-purple-100" />
          <span className="text-purple-100 font-medium">
            Twitter account connected successfully.
          </span>
          <button
            onClick={() => handleChatWithAgent("userAgent")}
            className="ml-auto p-2 rounded-full bg-cyan-500/70 hover:bg-cyan-500 transition-all duration-300 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <span className="text-white">Chat with agent</span>
          </button>
          <button
            onClick={handleDisconnect}
            className="ml-auto p-2 rounded-full bg-black/70 hover:bg-black transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-white">Log out</span>
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute -top-[150px] left-0 w-full transition-opacity duration-300",
        isConnectActive || isHovered
          ? "opacity-100 z-10"
          : "opacity-75 hover:z-10"
      )}
    >
      <div className="p-4 w-full rounded-lg bg-gradient-to-r from-purple-700/90 to-purple-700/90 border border-purple-600 opacity-100">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <FaXTwitter className="w-5 h-5 text-purple-100" />
            <span className="text-purple-100 font-medium">
              Connect with Twitter
            </span>
          </div>
          <button
            onClick={handleConnect}
            disabled={isLoading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-400/20 hover:bg-purple-400/30 text-white rounded-lg border border-purple-400/30 transition-all duration-300 backdrop-blur-sm button-connect"
          >
            {isLoading ? "Connecting..." : "Connect Twitter"}
          </button>
        </div>
      </div>
    </div>
  );
};
