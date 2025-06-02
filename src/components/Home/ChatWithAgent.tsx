"use client";

// react
import { useCallback, useEffect, useRef, useState, useId } from "react";

// next
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// utils
import { cn } from "@/lib/utils";

// http client
import axios from "axios";

// icons
import { Bot, Send, ChevronLeft, ChevronRight } from "lucide-react";

// web3

import { useAccount } from "wagmi";

// hooks
import { useCheckExistingAgent } from "@/hooks/useCheckExistingAgent";
import { usePrivy } from "@privy-io/react-auth";
import { firestoreTimestampToDate } from "@/utils/firestore-timestamp";
import { useLanguage } from "@/context/LanguageContext";

export enum ActionTrigger {
  Personality = "personality",
  Settings = "settings",
  Dashboard = "dashboard",
  Memories = "memories",
  // Payment = "payment",
  ConnectWallet = "connect_wallet",
  None = "none",
  CreateAgent = "create_agent",
  HowItWorks = "how_it_works",
  Demo = "demo",
  // SelectAgentType = "select_agent_type",
  RequestSocialHandle = "request_social_handle",
  CloneConfirmation = "clone_confirmation",
  CloneAgent = "clone_agent",
  CreateEmptyAgent = "create_empty_agent",
  NavigateToPage = "navigate_to_page",
  CreateAgentSuccess = "create_agent_success",
  DeployAgent = "DEPLOY_AGENT",
}

export function ChatWithAgent({
  account,
  trigger,
}: {
  account: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    username: string;
  };
  trigger?: "create_agent" | "none";
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const { data: session } = useSession();
  const hasShownPaymentMessage = useRef(false);

  const { address, isConnected } = useAccount();
  const { ready, authenticated, login } = usePrivy();
  const disableLogin = !ready || (ready && authenticated);
  const hasSendMessageWithWallet = useRef(false);

  const { t } = useLanguage();

  const [chatHistory, setChatHistory] = useState<
    Array<{
      role: "user" | "agent";
      content: string;
      isVisible?: boolean;
      action?: ActionTrigger;
      metadata?: { page: string; agentName: string };
      isThinking?: boolean;
    }>
  >([
    {
      role: "agent",
      content:
        "How can I help you today? Te puedo hablar en español or english",
      isVisible: true,
    },
  ]);

  const MAX_VISIBLE_MESSAGES = 4;

  const router = useRouter();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  const [lastAction, setLastAction] = useState<ActionTrigger | null>(null);

  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );

  const id = useId();

  useEffect(() => {
    bannerRef.current = document.querySelector(".banner-container");

    const handleScroll = (e: WheelEvent) => {
      if (scrollContainerRef.current) {
        e.preventDefault();
        const scrollSpeed = 1;
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollTop + e.deltaY * scrollSpeed,
          behavior: "smooth",
        });
      }
    };

    if (bannerRef.current) {
      bannerRef.current.addEventListener("wheel", handleScroll, {
        passive: false,
      });

      return () => {
        bannerRef.current?.removeEventListener("wheel", handleScroll);
      };
    }
  }, []);

  useEffect(() => {
    if (chatHistory.length > MAX_VISIBLE_MESSAGES) {
      const timer = setTimeout(() => {
        setChatHistory((prev) => prev.slice(-MAX_VISIBLE_MESSAGES));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [chatHistory]);

  const [loadingCreateAgent, setLoadingCreateAgent] = useState(false);

  const handleNavigate = useCallback(
    (agentName: string, metadata: { page: string; agentName: string }) => {
      setTimeout(() => {
        switch (metadata.page) {
          case "PERSONALITY":
            router.push(`/agent/${agentName}/personality`);
            break;
          case "MEMORIES":
            router.push(`/agent/${agentName}/memories`);
            break;
          case "DASHBOARD":
            router.push(`/agent/${agentName}`);
            break;
          case "SETTINGS":
            router.push(`/agent/${agentName}/settings`);
            break;
        }
      }, 1000);
    },
    [router]
  );

  const { agentExists, agents, refetch } = useCheckExistingAgent(
    isMounted,
    isConnected
  );

  const checkAgentCreationStatus = useCallback(
    async (addressLowerCase: string) => {
      let attempts = 0;
      const maxAttempts = 10;

      const interval = setInterval(async () => {
        try {
          const response = await fetch(
            `/api/agents?address=${addressLowerCase}`
          );
          const data = await response.json();

          if (response.status === 200 && data) {
            refetch();
            console.log("data", data);
            clearInterval(interval);
            setLoadingCreateAgent(false);
            setChatHistory((prev) => [
              ...prev,
              {
                role: "agent",
                content: "Your agent has been successfully created!",
                isVisible: true,
                action: ActionTrigger.CreateAgentSuccess,
                metadata: { page: "DASHBOARD", agentName: data.name },
              },
            ]);
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            setChatHistory((prev) => [
              ...prev,
              {
                role: "agent",
                content: "Agent creation took too long. Try again later.",
                isVisible: true,
              },
            ]);
          }

          attempts++;
        } catch (error) {
          console.error("Error checking agent status:", error);
        }
      }, 10000);
    },
    [refetch]
  );

  const handleTalkWithAgent = useCallback(
    async (message: string, action?: ActionTrigger) => {
      if (!message.trim()) return;

      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: message, isVisible: true },
        {
          role: "agent",
          content: "Thinking",
          isVisible: true,
          isThinking: true,
        },
      ]);

      if (!address && action !== ActionTrigger.HowItWorks) {
        setTimeout(() => {
          setChatHistory((prev) => [
            ...prev.slice(0, -1),
            {
              role: "agent",
              content:
                "Please connect your wallet or social account to continue",
              isVisible: true,
              action: ActionTrigger.ConnectWallet,
            },
          ]);
        }, 1000);
        return;
      }

      let userAddress;
      if (action === ActionTrigger.HowItWorks) {
        userAddress = id;
      } else {
        userAddress = address?.toLowerCase();
      }

      try {
        const response = await axios.post("/api/talk-with-a0x-agent", {
          message: message,
          userAddress: userAddress,
        });

        const data = response.data;

        console.log("data", data);

        if (
          data.syntheticResponse[0].action === ActionTrigger.DeployAgent &&
          data.syntheticResponse[0].metadata
        ) {
          setLoadingCreateAgent(true);
          setTimeout(() => {
            setLoadingCreateAgent(false);
            refetch();
          }, 1000);
        }

        // Handle parse response
        try {
          setChatHistory((prev) => [
            ...prev.slice(0, -1),
            {
              role: "agent",
              content: data.syntheticResponse[0].text,
              action: data.syntheticResponse[0].action,
              isVisible: true,
              metadata: data.syntheticResponse[0].metadata,
            },
          ]);
        } catch (e) {
          setChatHistory((prev) => [
            ...prev.slice(0, -1),
            {
              role: "agent",
              content: data.syntheticResponse[0].text,
              action: data.syntheticResponse[0].action,
              isVisible: true,
            },
          ]);
        }

        // Handle navigation
        if (
          agents &&
          data &&
          data.syntheticResponse[0].action === ActionTrigger.NavigateToPage &&
          data.syntheticResponse[0].metadata
        ) {
          handleNavigate(agents[0].name, data.syntheticResponse[0].metadata);
        }
      } catch (error) {
        console.error("Error:", error);
        setChatHistory((prev) => [
          ...prev,
          {
            role: "agent",
            content: "Sorry, there was an error processing your request.",
            isVisible: true,
          },
        ]);
      }

      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);

      setMessage("");
    },
    [address, handleNavigate, agents, checkAgentCreationStatus]
  );

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    if (!localStorage.getItem("chatHistoryTimestamp")) {
      localStorage.setItem("chatHistoryTimestamp", Date.now().toString());
    }
  }, [chatHistory, isMounted]);

  useEffect(() => {
    const isNeededWallet = chatHistory.some(
      (chat) => chat.action === "connect_wallet"
    );
    if (
      isConnected &&
      address &&
      isNeededWallet &&
      !hasSendMessageWithWallet.current
    ) {
      handleTalkWithAgent(
        `Wallet connected successfully! ${address.slice(
          0,
          6
        )}...${address.slice(-4)}`
      );
      hasSendMessageWithWallet.current = true;
    }
  }, [isConnected, address, handleTalkWithAgent, chatHistory]);

  const hasSendCreateAgentMessage = useRef(false);

  useEffect(() => {
    if (trigger === "create_agent" && !hasSendCreateAgentMessage.current) {
      handleTalkWithAgent(t.hero.createAgentMessage);
      hasSendCreateAgentMessage.current = true;
    }
  }, [trigger, handleTalkWithAgent, t]);

  const handleResetChat = async () => {
    localStorage.removeItem("chatHistory");
    localStorage.removeItem("chatHistoryTimestamp");
    hasShownPaymentMessage.current = false;

    setChatHistory([
      {
        role: "agent",
        content: "How can I help you today?",
        isVisible: true,
      },
    ]);

    if (address) {
      await axios.delete("/api/talk-with-a0x-agent", {
        data: {
          userAddress: address ? address?.toLowerCase() : id,
        },
      });
    }

    setMessage("");
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "56px";
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = scrollHeight > 96 ? "96px" : `${scrollHeight}px`;
    setMessage(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.metaKey) {
      handleTalkWithAgent(message);
      setMessage("");
      const textarea = e.target as HTMLTextAreaElement;
      textarea.style.height = "56px";
    }
  };

  useEffect(() => {
    const lastChatWithAction = [...chatHistory]
      .reverse()
      .find((chat) => chat.action !== undefined);

    if (lastChatWithAction?.action) {
      setLastAction(lastChatWithAction.action);
    }
  }, [chatHistory]);

  const changeAgent = (direction: "left" | "right") => {
    if (isAnimating) return;

    setIsAnimating(true);
    setSlideDirection(direction);

    setTimeout(() => {
      if (direction === "left" && agents) {
        setCurrentAgentIndex((prev) =>
          prev === 0 ? agents.length - 1 : prev - 1
        );
      } else if (direction === "right" && agents) {
        setCurrentAgentIndex((prev) =>
          prev === agents.length - 1 ? 0 : prev + 1
        );
      }
      setSlideDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="bg-[#121212] h-full flex flex-col justify-between">
      <section
        className={cn(
          "flex-1 max-md:min-h-[70vh] max-md:h-full bg-transparent transition-colors duration-200 flex flex-col relative overflow-hidden",
          chatHistory.some((msg) => msg.content.length > 200) && "min-h-auto"
        )}
      >
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto py-6 px-6 space-y-6 w-full pointer-events-auto"
        >
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`flex items-start w-max md:max-w-60 lg:max-w-72 xl:max-w-md space-x-4 ${
                chat.role === "agent" ? "" : "justify-end ml-auto"
              } transition-all duration-500 transform ${
                chat.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
            >
              {chat.role === "agent" && (
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-white/50 blur-lg" />
                  <div className="relative w-full h-full rounded-lg bg-black/20 border border-white flex items-center justify-center backdrop-blur-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              <div className="flex-1">
                <div
                  className={`px-4 py-3 rounded-lg backdrop-blur-sm ${
                    chat.role === "agent"
                      ? "bg-black/20 border border-white"
                      : "bg-white/20 border border-white"
                  }`}
                >
                  <p
                    className={`max-md:text-sm max-md:text-wrap max-md:w-40 ${
                      chat.role === "agent" ? "text-white" : "text-white"
                    }`}
                  >
                    {chat.content}
                    {chat.isThinking && (
                      <span className="inline-flex ml-1">
                        <span className="animate-bounce">.</span>
                        <span
                          className="animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        >
                          .
                        </span>
                        <span
                          className="animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        >
                          .
                        </span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex-shrink p-6 w-full h-auto flex flex-col gap-2">
        <div className="w-full flex flex-col gap-2 mb-2">
          {agentExists && agents && agents.length > 0 && (
            <div className="relative">
              {agents.length > 1 && (
                <button
                  onClick={() => changeAgent("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center border border-cyan-500/50 z-10 hover:bg-black/60 transition-all"
                  disabled={isAnimating}
                >
                  <ChevronLeft className="w-5 h-5 text-cyan-400" />
                </button>
              )}

              <div className="overflow-hidden relative">
                <div
                  className="flex transition-all duration-300 ease-in-out"
                  style={{
                    transform:
                      slideDirection === "left"
                        ? "translateX(5%)"
                        : slideDirection === "right"
                        ? "translateX(-5%)"
                        : "translateX(0)",
                    opacity: isAnimating ? 0.5 : 1,
                  }}
                >
                  {/* Contenedor del agente actual */}
                  <div className="w-full flex-shrink-0">
                    <Link
                      href={`/agent/${agents[currentAgentIndex].name}/dashboard`}
                    >
                      <div className="p-4 w-full rounded-lg bg-black/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 cursor-pointer">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
                              <span className="text-cyan-300 font-mono tracking-wider">
                                AGENT STATUS: CREATED
                              </span>
                            </div>
                            {agents.length > 1 && (
                              <span className="text-cyan-300 font-mono text-sm">
                                {currentAgentIndex + 1} / {agents.length}
                              </span>
                            )}
                          </div>

                          <div
                            className="flex flex-col gap-2 px-4 py-3 bg-black/60 text-white rounded-lg 
                              border border-cyan-500/30 backdrop-blur-sm 
                              relative before:absolute before:inset-0 before:border before:border-cyan-500/20 
                              before:rounded-lg before:translate-x-1 before:translate-y-1"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full bg-cyan-900/30 flex items-center justify-center
                                  border border-cyan-500/50 relative overflow-hidden
                                  before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-500/20 before:to-transparent"
                              >
                                <Bot className="w-6 h-6 text-cyan-400" />
                              </div>

                              <div className="flex flex-col">
                                <span className="font-mono text-cyan-300 tracking-wide">
                                  {agents[currentAgentIndex].name.toUpperCase()}
                                </span>

                                <span className="text-sm text-cyan-400/80 font-mono">
                                  INIT:{" "}
                                  {agents[currentAgentIndex].createdAt &&
                                    firestoreTimestampToDate(
                                      agents[currentAgentIndex].createdAt
                                    ).toLocaleDateString("en-US", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Indicadores de navegación */}
                {agents.length > 1 && (
                  <div className="flex justify-center mt-3 gap-1">
                    {agents.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (index !== currentAgentIndex && !isAnimating) {
                            setSlideDirection(
                              index < currentAgentIndex ? "left" : "right"
                            );
                            setIsAnimating(true);
                            setTimeout(() => {
                              setCurrentAgentIndex(index);
                              setSlideDirection(null);
                              setIsAnimating(false);
                            }, 300);
                          }
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentAgentIndex
                            ? "bg-cyan-400 w-4"
                            : "bg-cyan-800 hover:bg-cyan-600"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {agents.length > 1 && (
                <button
                  onClick={() => changeAgent("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center border border-cyan-500/50 z-10 hover:bg-black/60 transition-all"
                  disabled={isAnimating}
                >
                  <ChevronRight className="w-5 h-5 text-cyan-400" />
                </button>
              )}
            </div>
          )}

          {chatHistory.some(
            (chat) => chat.action === ActionTrigger.DeployAgent
          ) && (
            <div
              className={cn(
                "p-4 w-full rounded-lg bg-gradient-to-r border transition-all duration-300",
                "opacity-100",
                lastAction !== ActionTrigger.DeployAgent
                  ? "from-indigo-700/80 to-indigo-800/80 border-indigo-800/80"
                  : "from-cyan-700/80 to-cyan-800/80 border-cyan-800/80"
              )}
            >
              {lastAction === ActionTrigger.DeployAgent &&
                (() => {
                  console.log("Debug Info:");
                  console.log("Last Action:", lastAction);
                  console.log("Chat History:", chatHistory);
                  console.log(
                    "Last Message:",
                    chatHistory[chatHistory.length - 1]
                  );
                  console.log(
                    "Last Message Action:",
                    chatHistory[chatHistory.length - 1]?.action
                  );
                  console.log(
                    "Metadata:",
                    chatHistory[chatHistory.length - 1]?.metadata
                  );

                  const lastMessage = chatHistory[chatHistory.length - 1];
                  const agentName = lastMessage?.metadata?.agentName;

                  if (!agentName) {
                    console.log("No agent name found in metadata");
                    return null;
                  }

                  return (
                    <div className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-cyan-500/20 text-white rounded-lg border border-cyan-500/30 backdrop-blur-sm">
                      <span>Agent created successfully!</span>

                      <Link
                        href={`/agent/${agentName}/dashboard`}
                        className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-white rounded-lg border border-cyan-500/30 transition-all duration-300 backdrop-blur-sm"
                      >
                        View {agentName}
                      </Link>
                    </div>
                  );
                })()}
            </div>
          )}

          {chatHistory.map((chat, index) => {
            if (
              index === chatHistory.length - 1 &&
              chat.action === ActionTrigger.ConnectWallet
            ) {
              return (
                <div
                  key={index}
                  className="p-4 w-full rounded-lg bg-gradient-to-r from-blue-500/80 to-blue-500/80 border border-blue-500/80 opacity-100"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-300 font-medium">
                        Suggested action: Connect
                      </span>
                    </div>

                    <button
                      disabled={disableLogin}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-white rounded-lg border border-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                      onClick={() => {
                        console.log("Opening wallet...");
                        login();
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Connect
                    </button>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>

        <div className="relative w-full rounded-xl h-full min-h-[56px] max-h-[96px] bg-black/80 border border-white">
          <textarea
            rows={1}
            placeholder="Type a message..."
            className={cn(
              "w-10/12 px-6 py-4 bg-transparent rounded-xl text-sky-100 placeholder-gray-400/50 focus:outline-none focus:border-gray-400/50 transition-all duration-300 resize-none h-max min-h-[56px] max-h-[96px] line-clamp-3 overflow-y-auto"
            )}
            value={message}
            onChange={adjustTextareaHeight}
            onKeyDown={handleKeyPress}
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
              className="p-2 rounded-xl hover:bg-sky-500/10 transition-all duration-300"
              onClick={() => handleTalkWithAgent(message)}
            >
              <Send className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {!agentExists && (
          <div className="flex flex-wrap justify-around gap-2">
            {[
              {
                action: ActionTrigger.CreateAgent,

                label: "Create Agent",
                message: "Create my agent",
              },
              {
                action: ActionTrigger.HowItWorks,
                label: "How it works",
                message: "How it works",
              },
            ].map(
              ({
                action,
                label,
                message,
              }: {
                action: ActionTrigger;
                label: string;
                message: string;
              }) => (
                <button
                  key={label}
                  disabled={
                    action === ActionTrigger.CreateEmptyAgent &&
                    chatHistory.some(
                      (chat) => chat.action === ActionTrigger.CreateEmptyAgent
                    )
                  }
                  className="px-4 py-2 bg-gray-500/50 hover:bg-gray-500/60 backdrop-blur-sm border border-gray-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    handleTalkWithAgent(message, action);
                  }}
                >
                  {label}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
