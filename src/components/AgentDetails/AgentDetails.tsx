"use client";

// react
import { useMemo } from "react";

// next
import Image from "next/image";
import Link from "next/link";

// types
import { Agent, AgentType } from "@/types";

// lucide
import { Copy, MessageSquare, HousePlug, Clock } from "lucide-react";

// hooks
import { useAccount } from "wagmi";

// utils
import { cn } from "@/lib/utils";

interface AgentDetailsProps {
  agent: Agent | undefined;
  isLoading: boolean;
  isPersonalityBuildOpen: boolean;
  setIsPersonalityBuildOpen: (isOpen: boolean) => void;
  setIsMemoriesOpen: (isOpen: boolean) => void;
  agentToTalkWith: {
    agent: AgentType;
  };
  setAgentToTalkWith: (agent: AgentType) => void;
}

export function AgentDetails({
  agent,
  isLoading,
  setIsPersonalityBuildOpen,
  setIsMemoriesOpen,
  isPersonalityBuildOpen,
  agentToTalkWith,
  setAgentToTalkWith,
}: AgentDetailsProps) {
  const { address } = useAccount();

  const isOwner = useMemo(() => {
    if (!agent?.creatorAddress) return false;
    if (Array.isArray(agent.creatorAddress)) {
      return agent.creatorAddress.some((addr) => {
        if (typeof addr === "string") {
          return address?.toLowerCase() === addr.toLowerCase();
        }
        return false;
      });
    } else {
      const creatorAddressString = String(agent.creatorAddress);
      return address?.toLowerCase() === creatorAddressString.toLowerCase();
    }
  }, [address, agent]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleChangeAgentToTalkWith = (agentType: AgentType) => {
    setAgentToTalkWith(agentType);
    switch (agentType) {
      case "psicologist":
        setIsPersonalityBuildOpen(true);
        break;
      default:
        setIsPersonalityBuildOpen(false);
    }
    setIsMemoriesOpen(false);
  };

  if (!agent) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">
          Agent not found
        </h2>

        <Link
          href="/"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-[400px]">
      <div className="relative overflow-hidden rounded-md w-full bg-black/60 border border-white/20 hover:border-white/30 transition-all duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_100%)]" />
        <div className="relative p-6 w-full">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-white/50">
                <div className="absolute inset-0 bg-white/20 blur-lg" />
                <Image
                  src={
                    agent.imageUrl ||
                    "https://storage.googleapis.com/a0x-mirror-storage/agent-empty.png"
                  }
                  alt={agent.name}
                  width={64}
                  height={64}
                  className="object-cover relative"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white">
                  {agent.name}
                </h2>
              </div>
            </div>

            {agent.connectedWith && agent.connectedWith.length > 0 && (
              <div className="flex flex-col">
                <h2 className="text-sm font-mono text-white/70 mb-2">
                  Connected X Account{agent.connectedWith.length > 1 ? "s" : ""}
                </h2>

                {agent.connectedWith.map((connection, index) => (
                  <Link
                    key={index}
                    href={`https://x.com/${connection.username}`}
                    target="_blank"
                  >
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-black/80 rounded-md border border-white/20 mb-2 last:mb-0 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {connection.imageUrl && (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <div className="absolute inset-0 bg-white/20 blur-lg" />
                            <Image
                              src={connection.imageUrl}
                              alt={connection.username}
                              width={40}
                              height={40}
                              className="object-cover relative"
                            />
                          </div>
                        )}

                        <div className="flex flex-col">
                          <p className="font-medium text-white">
                            {connection.displayname}
                          </p>

                          <p className="text-sm text-white/50">
                            @{connection.username}
                          </p>
                        </div>
                      </div>

                      <Copy className="w-5 h-5 text-white" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {agent.capabilities && agent.capabilities.length > 0 && (
              <div className="flex flex-col">
                <h2 className="text-sm font-mono text-white/70 mb-2">
                  Capabilities
                </h2>

                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((capability, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-black/80 rounded-full border border-white/20 text-sm text-white/70"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Life Information */}
            {agent.life && (
              <div className="mt-4 p-4 bg-black/80 rounded-lg border border-white/20">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">LIFE STATUS</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 blur-lg rounded-full" />
                      <Clock className="w-5 h-5 text-white relative z-10" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-white/70">Expires on</span>
                      <span className="font-mono text-white">
                        {new Date(agent.life.expirationTime).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Information */}
            {agent.agentWallet && (
              <div className="mt-4 p-4 bg-black/80 rounded-lg border border-white/20">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">
                      AGENT WALLET ADDRESS
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white">{`${agent.agentWallet.walletAddress.slice(
                        0,
                        6
                      )}...${agent.agentWallet.walletAddress.slice(-4)}`}</span>

                      <button className="text-white/50 hover:text-white/70">
                        <Copy className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Token Information */}
            {agent.token && (
              <div className="mt-4 p-4 bg-black/80 rounded-lg border border-white/20">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">TOKEN CA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white">{`${agent.token.address.slice(
                        0,
                        6
                      )}...${agent.token.address.slice(-4)}`}</span>

                      <button className="text-white/50 hover:text-white/70">
                        <Copy className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => handleChangeAgentToTalkWith("userAgent")}
          className={cn(
            "px-4 py-2 h-10 bg-black text-cyan-500 font-mono rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2",
            "border border-cyan-500/50 shadow-[0_0_15px_rgba(34,210,250,0.2)]",
            "hover:shadow-[0_0_20px_rgba(34,210,250,0.4)] hover:border-cyan-400",
            "hover:text-cyan-400 hover:bg-black"
          )}
        >
          <MessageSquare className="w-4 h-4 text-cyan-500" />
          Chat with {isOwner ? "your agent" : agent.name}
        </button>

        <button
          className={cn(
            "px-4 py-2 h-10 bg-black text-white font-mono rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2",
            "border border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]",
            "hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:border-white",
            "hover:text-white hover:bg-black"
          )}
        >
          <HousePlug className="w-4 h-4 text-white" />
          Extend agent life
        </button>
      </div>
    </div>
  );
}
