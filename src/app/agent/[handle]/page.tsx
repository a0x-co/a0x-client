"use client";

// react
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// next
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

// http client
import axios from "axios";

// wagmi
import { useAccount } from "wagmi";

// components
import { FinalizePersonaCard } from "@/components/AgentDashboard/FinalizePersonaCard";
import { PersonalityBuild } from "@/components/AgentDashboard/PersonalityBuild";
import { AgentDetails } from "@/components/AgentDetails/AgentDetails";
import { ChatMessage } from "@/components/Chat/ChatMessage";
import TokenChart from "@/components/Token/TokenChart";
import { TokenTrade } from "@/components/Token/TokenTrade";

// types
import {
  Agent,
  AgentPersonalityConfig,
  AgentPersonalityElizaFormat,
  AgentType,
  PersonalityBuildActionTrigger,
} from "@/types";

// icons
import { ArrowLeft, Bot, Send } from "lucide-react";

// utils
import { cn } from "@/lib/utils";
import generateId from "@/lib/uuid";

// hooks
import { useQuery } from "@tanstack/react-query";

const getAgent = async (handle: string): Promise<Agent | null> => {
  try {
    const response = await fetch(`/api/agents?name=${handle}`);
    const agent = await response.json();
    if (!agent) {
      return null;
    }

    console.log("agent", agent);
    return agent;
  } catch (error) {
    console.error("Error fetching agent:", error);
    throw error;
  }
};

export default function AgentPage({ params }: { params: { handle: string } }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{
      role: "user" | AgentType;
      content: string;
      isVisible?: boolean;
      isThinking?: boolean;
    }>
  >([
    {
      role: "userAgent",
      content: "GM, how can I help you today?",
      isVisible: true,
    },
  ]);

  const [chatPersonality, setChatPersonality] = useState<
    Array<{
      role: "user" | AgentType;
      content: string;
      isVisible?: boolean;
      action?: PersonalityBuildActionTrigger;
      personality?: AgentPersonalityElizaFormat;
    }>
  >([
    {
      role: "psicologist",
      content:
        "Hey! 👋 If you want to make your agent better, just talk to me. The more we chat, the more ideas we'll find to improve it",
      isVisible: true,
    },
  ]);

  const [chatWealthManager, setChatWealthManager] = useState<
    Array<{
      role: "user" | "wealth-manager";
      content: string;
      isVisible?: boolean;
    }>
  >([
    {
      role: "wealth-manager",
      content: "Loading agent information...",
      isVisible: true,
    },
  ]);

  const [responseTime, setResponseTime] = useState(0);
  const [isPersonalityBuildOpen, setIsPersonalityBuildOpen] =
    useState<boolean>(false);
  const [isMemoriesOpen, setIsMemoriesOpen] = useState<boolean>(false);
  const [config, setConfig] = useState<AgentPersonalityConfig>({
    bio: [],
    name: "",
    modelProvider: "",
    clients: [],
    settings: [],
    source: {
      type: "",
      username: "",
    },
    knowledge: [],
    lore: [],
    messageExamples: [],
    postExamples: [],
    status: "",
    style: {
      all: [],
      chat: [],
      post: [],
    },
    topics: [],
    adjectives: [],
    system: "",
  });

  const chatContainerRef = useRef<HTMLUListElement>(null);
  const { address } = useAccount();

  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [isFinalizeActive, setIsFinalizeActive] = useState(false);
  const [finalizedSuccess, setFinalizedSuccess] = useState(false);
  const [isConnectXSuccess, setIsConnectXSuccess] = useState(false);
  const [isConnectXActive, setIsConnectXActive] = useState(false);

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

  const MAX_VISIBLE_MESSAGES = 4;

  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [isInstructionVisible, setIsInstructionVisible] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      const agent = await getAgent(params.handle);
      setAgent(agent);
    };
    fetchAgent();
  }, [params.handle]);

  const searchParams = useSearchParams();
  const tokenView = searchParams.get("tokenView");

  useEffect(() => {
    if (tokenView) {
      setAgentToTalkWith({
        agent: "wealth-manager",
      });
    }
  }, [tokenView]);

  useEffect(() => {
    const limitMessages = <
      T extends { role: string; content: string; isVisible?: boolean }
    >(
      chatArray: T[]
    ): T[] => {
      if (chatArray.length > MAX_VISIBLE_MESSAGES) {
        return chatArray.slice(-MAX_VISIBLE_MESSAGES);
      }
      return chatArray;
    };

    if (chatHistory.length > MAX_VISIBLE_MESSAGES) {
      const timer = setTimeout(() => {
        setChatHistory((prev) => limitMessages(prev));
      }, 500);
      return () => clearTimeout(timer);
    }

    if (chatPersonality.length > MAX_VISIBLE_MESSAGES) {
      const timer = setTimeout(() => {
        setChatPersonality((prev) => limitMessages(prev));
      }, 500);
      return () => clearTimeout(timer);
    }

    if (chatWealthManager.length > MAX_VISIBLE_MESSAGES) {
      const timer = setTimeout(() => {
        setChatWealthManager((prev) => limitMessages(prev));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [chatHistory, chatPersonality, chatWealthManager]);

  const checkOverflow = useCallback(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const isOverflowing = container.scrollHeight > container.clientHeight;

      if (
        isOverflowing &&
        !isPersonalityBuildOpen &&
        chatHistory.length > MAX_VISIBLE_MESSAGES
      ) {
        setChatHistory((prev) => prev.slice(1));
      }
    }
  }, [isPersonalityBuildOpen, chatHistory]);

  useEffect(() => {
    checkOverflow();
  }, [chatHistory, checkOverflow]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    if (chatContainerRef.current) {
      resizeObserver.observe(chatContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkOverflow]);

  const [agentToTalkWith, setAgentToTalkWith] = useState<{
    agent: AgentType;
  }>({
    agent: "userAgent",
  });

  const id = generateId();

  const handleTalkWithAgent = async (message: string) => {
    if (!message.trim() || !agent) return;

    setIsLoading(true);

    setChatHistory((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
        isVisible: true,
      },
      {
        role: "userAgent",
        content: "Thinking",
        isVisible: true,
        isThinking: true,
      },
    ]);

    const startTime = Date.now();

    try {
      const response = await axios.post(`/api/message-agent`, {
        message: message,
        userId: address || id,
        agentId: agent.agentId,
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      setResponseTime(responseTime);

      setChatHistory((prev) =>
        prev.slice(0, -1).concat({
          role: "userAgent",
          content: response.data[0].text,
          isVisible: true,
        })
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory((prev) =>
        prev.slice(0, -1).concat({
          role: "userAgent",
          content: "Sorry, there was an error processing your request.",
          isVisible: true,
        })
      );
    } finally {
      setIsLoading(false);
      setMessage("");
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.metaKey && !isMemoriesOpen) {
      handleScrollToBottom();
      handleMessageMap[agentToTalkWith.agent](message);
      setMessage("");
    }
  };

  const handleScrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const [originalPersonality, setOriginalPersonality] =
    useState<AgentPersonalityConfig>();
  const handleTalkWithAgentPersonality = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      setChatPersonality((prev) => [
        ...prev,
        { role: "user", content: message, isVisible: true },
        {
          role: "psicologist",
          content: "Thinking",
          isVisible: true,
          isThinking: true,
        },
      ]);

      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }

      setMessage("");

      try {
        if (!agent) {
          console.error("Agent not found");
          return;
        }

        const response = await axios.post("/api/build-personality", {
          message: message,
          userAddress: address?.toLowerCase(),
          agentName: agent.name,
        });

        const data = response.data;

        let parsedResponse: {
          message: string;
          action?: PersonalityBuildActionTrigger;
          personality?: AgentPersonalityElizaFormat;
        };

        // Handle parse response
        try {
          parsedResponse = JSON.parse(data.syntheticResponse.message);

          setChatPersonality((prev) =>
            prev.slice(0, -1).concat({
              role: "psicologist",
              content: parsedResponse.message,
              action: parsedResponse.action || data.syntheticResponse.action,
              personality:
                parsedResponse.personality ||
                data.syntheticResponse.personality,
              isVisible: true,
            })
          );
          const requiredPersonalityFields = {
            bio:
              parsedResponse.personality?.bio ||
              data.syntheticResponse.personality?.bio,
            lore:
              parsedResponse.personality?.lore ||
              data.syntheticResponse.personality?.lore,
            style: {
              all:
                parsedResponse.personality?.style.all ||
                data.syntheticResponse.personality?.style.all,
              chat:
                parsedResponse.personality?.style.chat ||
                data.syntheticResponse.personality?.style.chat,
              post:
                parsedResponse.personality?.style.post ||
                data.syntheticResponse.personality?.style.post,
            },
            knowledge:
              parsedResponse.personality?.knowledge ||
              data.syntheticResponse.personality?.knowledge,
            topics:
              parsedResponse.personality?.topics ||
              data.syntheticResponse.personality?.topics,
            messageExamples:
              parsedResponse.personality?.messageExamples ||
              data.syntheticResponse.personality?.messageExamples,
            postExamples:
              parsedResponse.personality?.postExamples ||
              data.syntheticResponse.personality?.postExamples,
            adjectives:
              parsedResponse.personality?.adjectives ||
              data.syntheticResponse.personality?.adjectives,
            system:
              parsedResponse.personality?.system ||
              data.syntheticResponse.personality?.system,
          };
          setConfig(requiredPersonalityFields);
          setOriginalPersonality(requiredPersonalityFields);
        } catch (e) {
          setChatPersonality((prev) =>
            prev.slice(0, -1).concat({
              role: "psicologist",
              content: data.syntheticResponse.message,
              action: data.syntheticResponse.action,
              personality: data.syntheticResponse.personality,
              isVisible: true,
            })
          );
          const requiredPersonalityFields = {
            bio: data.syntheticResponse.personality.bio,
            lore: data.syntheticResponse.personality.lore,
            style: data.syntheticResponse.personality.style,
            knowledge: data.syntheticResponse.personality.knowledge,
            topics: data.syntheticResponse.personality.topics,
            messageExamples: data.syntheticResponse.personality.messageExamples,
            postExamples: data.syntheticResponse.personality.postExamples,
            adjectives: data.syntheticResponse.personality.adjectives,
            system: data.syntheticResponse.personality?.system,
          };
          setConfig(requiredPersonalityFields);
          setOriginalPersonality(requiredPersonalityFields);
        }
      } catch (error) {
        console.error("Error:", error);
        setChatPersonality((prev) => [
          ...prev,
          {
            role: "psicologist",
            content: "Sorry, there was an error processing your request.",
            isVisible: true,
          },
        ]);
      }
      handleScrollToBottom();
      setMessage("");
    },
    [address, agent]
  );

  const handleResetChat = useCallback(async () => {
    setChatPersonality([
      {
        role: "psicologist",
        content: "Hey! Let's shape your agent's personality together",
        isVisible: true,
      },
    ]);

    if (address) {
      switch (agentToTalkWith.agent) {
        case "psicologist":
          const response = await axios.delete("/api/build-personality", {
            data: {
              userAddress: address,
            },
          });
          break;
      }
    }

    setMessage("");
  }, [address, agentToTalkWith]);

  const hasReset = useRef(false);

  useEffect(() => {
    if (finalizedSuccess && !hasReset.current) {
      hasReset.current = true;
      handleResetChat();
    }
    if (!finalizedSuccess) {
      hasReset.current = false;
    }
  }, [finalizedSuccess, handleResetChat]);

  const handleTalkWithWealthManager = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      setChatWealthManager((prev) => [
        ...prev,
        { role: "user", content: message, isVisible: true },
      ]);

      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }

      setMessage("");

      const startTime = Date.now();

      try {
        const response = await axios.post("/api/wealth-manager", {
          message: message,
          userAddress: address?.toLowerCase(),
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;
        setResponseTime(responseTime);

        const data = response.data;

        setChatWealthManager((prev) => [
          ...prev,
          {
            role: "wealth-manager",
            content: data.syntheticResponse.message,
            isVisible: true,
          },
        ]);
      } catch (error) {
        console.error("Error:", error);
        setChatWealthManager((prev) => [
          ...prev,
          {
            role: "wealth-manager",
            content: "Sorry, there was an error processing your request.",
            isVisible: true,
          },
        ]);
      }
    },
    [address]
  );

  const handleChangeAgentToTalkWith = (agentType: AgentType) => {
    setAgentToTalkWith({ agent: agentType });
  };

  const handleMessageMap = {
    userAgent: handleTalkWithAgent,
    psicologist: handleTalkWithAgentPersonality,
    "wealth-manager": handleTalkWithWealthManager,
  };

  useEffect(() => {
    if (agent) {
      setChatWealthManager([
        {
          role: "wealth-manager",
          content: agent.token?.address
            ? `Your token is deployed at ${agent.token.address}`
            : "Launch your token with me, and allow other user to hire your agent",
          isVisible: true,
        },
      ]);
    }
  }, [agent]);

  const hasParamConnectTwitter = useSearchParams().get("connectTwitter");
  const twitterConnected = useRef(false);
  const sendAuthToken = useRef(false);
  const showCardTwitterConnect = useRef(hasParamConnectTwitter === "true");
  const showCardTwitter = hasParamConnectTwitter
    ? showCardTwitterConnect.current
    : true;
  const { data: session } = useSession();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await fetch(
          `/api/user?address=${address?.toLocaleLowerCase()}`
        );
        const data = await response.json();
        console.log("[ConnectTwitterCard] user", data);
        return data;
      } catch (error) {
        console.error("Error to get the account:", error);
        return null;
      }
    },
    enabled:
      !!address &&
      (hasParamConnectTwitter === "true" ? sendAuthToken.current : true),
  });

  return (
    <main className="min-h-screen w-screen overflow-hidden bg-black relative flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_100%)]" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative mt-12">
        <div className="flex items-center justify-between mb-4">
          <Link href="/workforce">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black text-white transition-all duration-300 border border-white/30 hover:bg-white/10 hover:border-white/60 w-fit font-mono text-sm cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>./return</span>
            </div>
          </Link>

          <div className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/20 w-fit font-mono">
            <span className="text-sm text-white">
              Response: {(responseTime / 1000).toFixed(2)}s
            </span>
          </div>
        </div>

        <div className="lg:hidden mb-4">
          {agent && (
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 ">
              <AgentDetails
                agent={agent}
                isLoading={false}
                isPersonalityBuildOpen={isPersonalityBuildOpen}
                setIsPersonalityBuildOpen={setIsPersonalityBuildOpen}
                setIsMemoriesOpen={setIsMemoriesOpen}
                agentToTalkWith={agentToTalkWith}
                setAgentToTalkWith={handleChangeAgentToTalkWith}
              />
            </div>
          )}

          {agentToTalkWith.agent === "wealth-manager" &&
            agent?.token?.address && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10  h-[440px]">
                <TokenTrade tokenAddress={agent?.token?.address} />
              </div>
            )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col">
            <div className="p-4 rounded-xl bg-black/40 border border-white/10  h-full">
              <ul
                ref={chatContainerRef}
                className="flex-1 flex flex-col h-[65vh] overflow-y-auto gap-4 w-full mx-auto max-h-[calc(100vh-400px)] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20"
              >
                {isMemoriesOpen && (
                  <div className="flex-1 h-[65%] py-6 space-y-6 w-full mx-auto"></div>
                )}

                {!isMemoriesOpen &&
                  isOwner &&
                  agentToTalkWith.agent === "psicologist" &&
                  agent &&
                  originalPersonality && (
                    <PersonalityBuild
                      chatMessages={chatPersonality}
                      agent={agent}
                      config={config}
                      setConfig={setConfig}
                      originalPersonality={originalPersonality}
                      setOriginalPersonality={setOriginalPersonality}
                    />
                  )}

                {!isMemoriesOpen &&
                  agentToTalkWith.agent === "wealth-manager" && (
                    <>
                      {!agent?.token &&
                        chatWealthManager.map((chat, index) => (
                          <ChatMessage
                            key={index}
                            role={chat.role}
                            content={chat.content}
                            isVisible={chat.isVisible}
                            agentToTalkWith={agentToTalkWith}
                          />
                        ))}

                      {agent?.token?.address && (
                        <div className="w-full mb-4">
                          <TokenChart
                            tokenName={agent.token.name}
                            tokenAddress={agent.token.address}
                            tokenSymbol={agent.token.symbol}
                            agentImage={agent.imageUrl}
                            poolAddress={agent.token.poolAddress}
                          />
                        </div>
                      )}
                    </>
                  )}

                {!isMemoriesOpen &&
                  agentToTalkWith.agent === "userAgent" &&
                  chatHistory.map((chat, index) => (
                    <ChatMessage
                      key={index}
                      role={chat.role}
                      content={chat.content}
                      isVisible={chat.isVisible}
                      isThinking={chat.isThinking}
                      agentToTalkWith={agentToTalkWith}
                    />
                  ))}
              </ul>
            </div>
          </div>

          <div
            className={cn(
              "hidden lg:block w-[320px] flex-shrink-0 space-y-4",
              agentToTalkWith.agent === "wealth-manager" &&
                agent?.token?.address
                ? "w-[440px]"
                : ""
            )}
          >
            {agent &&
            agentToTalkWith.agent === "wealth-manager" &&
            agent?.token?.address ? (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10  h-full">
                <TokenTrade tokenAddress={agent?.token?.address} />
              </div>
            ) : (
              agent && (
                <AgentDetails
                  agent={agent}
                  isLoading={false}
                  isPersonalityBuildOpen={isPersonalityBuildOpen}
                  setIsPersonalityBuildOpen={setIsPersonalityBuildOpen}
                  setIsMemoriesOpen={setIsMemoriesOpen}
                  agentToTalkWith={agentToTalkWith}
                  setAgentToTalkWith={handleChangeAgentToTalkWith}
                />
              )
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-black/80  border-t border-white/10 py-4">
        <div className="w-full max-w-2xl mx-auto relative rounded-2xl bg-black/80 border border-white/30 px-6 py-4">
          {isPersonalityBuildOpen &&
            agent &&
            agent.endpoint &&
            (chatPersonality.length > 2 || finalizedSuccess) && (
              <FinalizePersonaCard
                userAddress={address || ""}
                agentName={agent.name}
                onFinalize={() => {
                  setIsFinalizeActive(true);
                }}
                onDesactivate={() => setIsFinalizeActive(false)}
                isFinalizeActive={isFinalizeActive}
                config={config}
                action={chatPersonality[chatPersonality.length - 1]?.action}
                isFinalizeSuccess={finalizedSuccess}
                setFinalizedSuccess={setFinalizedSuccess}
                agentEndpoint={agent.endpoint}
              />
            )}

          <input
            type="text"
            placeholder="Type a message..."
            className="w-10/12 text-white bg-transparent border-none placeholder-white/30 focus:outline-none focus:border-white/50 transition-all duration-300 font-mono"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              className="p-2 rounded-xl hover:bg-red-500/10 transition-all duration-300"
              onClick={handleResetChat}
              title="Reset chat"
            >
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              className="p-2 rounded-xl hover:bg-white/10 transition-all duration-300"
              onClick={() => handleTalkWithAgent(message)}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
          {/* Placeholders from personality build */}
          {agentToTalkWith.agent === "psicologist" &&
            chatPersonality.length <= 2 &&
            !isFinalizeActive &&
            chatPersonality[chatPersonality.length - 1]?.action !==
              PersonalityBuildActionTrigger.GET_CURRENT_PERSONALITY && (
              <div
                className={cn(
                  "absolute -top-20 left-0 w-full flex items-center justify-center gap-4 opacity-75 peer-hover:opacity-75 peer-hover:z-10 transition-opacity duration-300 hover:opacity-100"
                )}
              >
                {[
                  {
                    action:
                      PersonalityBuildActionTrigger.GET_CURRENT_PERSONALITY,
                    label: "Current Personality",
                    message: `What is my current personality?`,
                  },
                ].map(({ action, label, message }) => (
                  <button
                    key={label}
                    className="px-4 py-2 bg-gray-500/50 hover:bg-gray-500/60  border border-gray-500 text-white rounded-xl"
                    onClick={async () => {
                      await handleTalkWithAgentPersonality(message);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>
    </main>
  );
}
