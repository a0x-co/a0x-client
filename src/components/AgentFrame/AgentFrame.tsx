"use client";

// react
import { useCallback, useEffect, useId, useRef, useState } from "react";

// http client
import axios from "axios";

// types
import { Agent, AgentPersonalityConfig, AgentType } from "@/types";

// icons
import { cn } from "@/lib/utils";
import sdk, { type Context } from "@farcaster/frame-sdk";
import { useQuery } from "@tanstack/react-query";
import { Send, User } from "lucide-react";
import Image from "next/image";
import ParticleEffect from "../Landing/animation/ParticleEffect";
import Link from "next/link";
import FarcasterIcon from "../Icons/FarcasterIcon";

const getAgent = async (handle: string): Promise<Agent | null> => {
  try {
    const response = await fetch(`/api/agents?name=${handle}`);
    const agent = await response.json();
    if (!agent) {
      return null;
    }
    return agent;
  } catch (error) {
    console.error("Error fetching agent:", error);
    throw error;
  }
};

const getPersonality = async (
  handle: string
): Promise<AgentPersonalityConfig | null> => {
  try {
    const response = await fetch(`/api/personality-agent?handle=${handle}`);
    const personality = await response.json();
    return personality;
  } catch (error) {
    console.error("Error fetching personality:", error);
    return null;
  }
};

interface AgentFrameProps {
  handle: string;
}

const TypewriterEffect = ({
  text,
  speed = 30,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Referencia al contenedor de chat para acceder desde aquí
  const chatContainerRef = useRef<HTMLUListElement | null>(null);

  // Obtener la referencia del componente padre
  useEffect(() => {
    chatContainerRef.current = document.querySelector("ul.flex.flex-col.gap-4");
  }, []);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);

        // Scroll mientras se escribe
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      }, speed);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  // Reiniciar cuando cambie el texto
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  return (
    <span>
      {displayedText}
      <span className="animate-pulse">▌</span>
    </span>
  );
};

const AnimatedChatMessage = ({
  role,
  content,
  isVisible = true,
  isThinking = false,
  agentToTalkWith,
  imageInvited,
  imageAgentFarcaster,
  onTypingProgress,
}: {
  role: "user" | AgentType;
  content: string;
  isVisible?: boolean;
  isThinking?: boolean;
  agentToTalkWith: { agent: AgentType };
  imageInvited?: string | null;
  imageAgentFarcaster?: string;
  onTypingProgress?: () => void;
}) => {
  const [isTyping, setIsTyping] = useState(role !== "user");
  const [showFullText, setShowFullText] = useState(role === "user");

  // Cuando se completa la animación
  const handleTypingComplete = () => {
    setIsTyping(false);
    setShowFullText(true);
  };

  if (!isVisible) return null;

  return (
    <li
      className={`flex ${
        role === "user" ? "justify-end" : "justify-start"
      } w-full`}
    >
      <div
        className={`flex gap-2 max-w-[80%] ${
          role === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          {role === "user" ? (
            imageInvited ? (
              <Image
                src={imageInvited}
                alt="User"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-full h-full object-cover" />
            )
          ) : (
            <Image
              src={imageAgentFarcaster || "/assets/logos/a0x-logo.png"}
              alt="Agent"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Mensaje */}
        <div
          className={`p-3 rounded-xl ${
            role === "user"
              ? "bg-blue-600 text-white rounded-tr-none"
              : "bg-gray-800 text-white rounded-tl-none"
          }`}
        >
          {isThinking ? (
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
                style={{ animationDelay: "600ms" }}
              ></div>
            </div>
          ) : (
            <div className="text-sm">
              {role !== "user" && isTyping ? (
                <TypewriterEffect
                  text={content}
                  speed={20}
                  onComplete={handleTypingComplete}
                />
              ) : (
                <span>{content}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default function AgentFrame({ handle }: AgentFrameProps) {
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
      content: "Hi, how can I help you today?",
      isVisible: true,
    },
  ]);

  const [responseTime, setResponseTime] = useState(0);
  const [personality, setPersonality] = useState<AgentPersonalityConfig | null>(
    null
  );
  const chatContainerRef = useRef<HTMLUListElement>(null);

  // Estado para el SDK de Farcaster
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Cargar el SDK de Farcaster
  useEffect(() => {
    const loadSDK = async () => {
      try {
        setIsSDKLoaded(true);
        const context = await sdk.context;
        setContext(context);
        console.log(context?.user);

        // Get user avatar if exists
        if (context?.user?.pfpUrl) {
          setUserAvatar(context.user.pfpUrl);
        }

        // Add listeners for frame events
        sdk.on("frameAdded", ({ notificationDetails }) => {
          console.log("Frame added", notificationDetails);
        });

        sdk.on("frameAddRejected", ({ reason }) => {
          console.log("Frame rejected", reason);
        });

        sdk.on("frameRemoved", () => {
          console.log("Frame removed");
        });

        sdk.on("notificationsEnabled", ({ notificationDetails }) => {
          console.log("Notifications enabled", notificationDetails);
        });

        sdk.on("notificationsDisabled", () => {
          console.log("Notifications disabled");
        });

        sdk.on("primaryButtonClicked", () => {
          console.log("Primary button clicked");
        });
        // Indicate that the frame is ready
        console.log("Calling ready");
        sdk.actions.ready({});
      } catch (error) {
        console.error("Error loading Farcaster SDK:", error);
      }
    };
    if (sdk && !isSDKLoaded) {
      console.log("Starting load");
      setIsSDKLoaded(true);
      loadSDK();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  const { data: personalityData } = useQuery({
    queryKey: ["personality", handle],
    queryFn: () => {
      if (!handle) {
        return null;
      }
      return getPersonality(handle);
    },
    enabled: !!handle,
  });

  const { data: agentData } = useQuery({
    queryKey: ["agent", handle],
    queryFn: () => {
      if (!handle) {
        return null;
      }
      return getAgent(handle);
    },
    enabled: !!handle,
  });

  useEffect(() => {
    if (agentData) {
      setAgent(agentData);
    }
  }, [agentData]);

  useEffect(() => {
    if (personalityData) {
      setPersonality(personalityData);
    }
  }, [personalityData]);

  const id = useId();

  const handleScrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, []);

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

    // Scroll después de agregar mensajes
    setTimeout(handleScrollToBottom, 100);

    const startTime = Date.now();

    try {
      const response = await axios.post(`/api/message-agent`, {
        message: message,
        userId: id,
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

      // Scroll después de recibir respuesta
      setTimeout(handleScrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory((prev) =>
        prev.slice(0, -1).concat({
          role: "userAgent",
          content: "Sorry, there was an error processing your request.",
          isVisible: true,
        })
      );

      // Scroll después de error
      setTimeout(handleScrollToBottom, 100);
    } finally {
      setIsLoading(false);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.metaKey) {
      handleTalkWithAgent(message);
      setMessage("");
    }
  };

  // Funciones para acciones de Farcaster
  const openAgentProfile = useCallback(async () => {
    if (isSDKLoaded && agent) {
      const sdk = await import("@farcaster/frame-sdk");
      sdk.default.actions.openUrl(
        `https://warpcast.com/${agent.farcasterClient?.username || ""}`
      );
    }
  }, [isSDKLoaded, agent]);

  const closeFrame = useCallback(async () => {
    if (isSDKLoaded) {
      const sdk = await import("@farcaster/frame-sdk");
      sdk.default.actions.close();
    }
  }, [isSDKLoaded]);

  useEffect(() => {
    // Auto scroll to bottom when chat history changes
    handleScrollToBottom();
  }, [chatHistory, handleScrollToBottom]);

  if (!isSDKLoaded || !hasUserInteracted) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-6 relative">
        {/* Fondo con opacidad */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-950 via-black to-gray-950" />
        <ParticleEffect
          type="circle"
          color="#fff"
          glowColor="rgba(255, 255, 255, 0.1)"
          count={20}
          size={0.5}
          animation="spiral"
          speed={0.08}
          spiralWidth={1}
          spiralHeight={1}
        />

        {/* Contenido */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <button
            onClick={() => {
              setHasUserInteracted(true);
            }}
            className="px-8 py-3 bg-gradient-to-tr from-white via-blue-50 to-white hover-gradient text-white rounded-xl font-semibold 
                     hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl 
                     transform hover:-translate-y-0.5 active:translate-y-0
                     flex items-center gap-2"
          >
            <Image
              src={
                agent?.imageUrl ||
                agent?.farcasterClient?.pfp_url ||
                "https://storage.googleapis.com/a0x-mirror-storage/agent-empty.png"
              }
              alt="Avatar"
              className="w-6 h-6 rounded-full"
              width={24}
              height={24}
            />
            <span className={cn("text-lg text-black")}>Chat with {handle}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-hidden bg-black relative flex flex-col pt-20">
      <div className="w-full h-[calc(100vh-85px)] flex flex-col">
        {/* Agent header with bio */}
        {agent && (
          <div className="p-3 bg-black/60 border-b border-white/10">
            <div className="flex items-center gap-3">
              {agent.imageUrl ? (
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={agent.imageUrl}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                    width={40}
                    height={40}
                  />
                </div>
              ) : agent.farcasterClient?.pfp_url ? (
                <div
                  className="w-10 h-10 rounded-full relative cursor-pointer"
                  onClick={openAgentProfile}
                >
                  <Image
                    src={agent.farcasterClient.pfp_url}
                    alt={agent.farcasterClient.username}
                    className="w-full h-full object-cover border-2 border-purple-500/50 rounded-full"
                    width={40}
                    height={40}
                  />
                  <Image
                    src={"/assets/logos/farcaster.png"}
                    alt={"Farcaster"}
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 object-cover z-10"
                    width={10}
                    height={10}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                  <Image
                    src={
                      "https://storage.googleapis.com/a0x-mirror-storage/agent-empty.png"
                    }
                    alt={"Agent"}
                    className="w-full h-full object-cover"
                    width={40}
                    height={40}
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1
                    className="text-white font-medium cursor-pointer"
                    onClick={openAgentProfile}
                  >
                    {agent.name}
                  </h1>
                  {agent.farcasterClient && (
                    <Link
                      href={`https://warpcast.com/${agent.farcasterClient.username}`}
                      target="_blank"
                      className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full"
                    >
                      <FarcasterIcon className="w-4 h-4" />
                    </Link>
                  )}
                  {agent?.token && (
                    <Link
                      href={`/agent/${agent.name}?tokenView=1`}
                      className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full"
                    >
                      ${agent.token.symbol}
                    </Link>
                  )}
                </div>
                {personality?.bio && personality.bio.length > 0 && (
                  <p className="text-white/70 text-xs line-clamp-2">
                    {personality.bio[0]}
                  </p>
                )}
                <p className="text-white/60 text-xs">
                  Response: {(responseTime / 1000).toFixed(2)}s
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chat container - flex-1 makes it take available space */}
        <div className="flex-1 p-4 overflow-y-auto mb-16 h-full">
          <ul
            ref={chatContainerRef}
            className="flex flex-col gap-4 w-full mx-auto overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent h-full"
          >
            {chatHistory.map((chat, index) => (
              <AnimatedChatMessage
                key={index}
                role={chat.role}
                content={chat.content}
                isVisible={chat.isVisible}
                isThinking={chat.isThinking}
                agentToTalkWith={{ agent: "userAgent" }}
                imageInvited={userAvatar}
                imageAgentFarcaster={
                  agent?.imageUrl ||
                  agent?.farcasterClient?.pfp_url ||
                  "https://storage.googleapis.com/a0x-mirror-storage/agent-empty.png"
                }
              />
            ))}
          </ul>
        </div>

        {/* Input area - fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 border-t border-white/10 p-3">
          <div className="relative rounded-xl bg-black/80 border border-white/30 px-4 py-3">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full text-white bg-transparent border-none placeholder-white/30 focus:outline-none focus:border-white/50 transition-all duration-300 font-mono pr-10"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />

            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-300"
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
        </div>
      </div>
    </main>
  );
}
