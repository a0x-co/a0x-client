"use client";

// react
import { useCallback, useEffect, useRef, useState } from "react";

// next
import { useSession } from "next-auth/react";

// utils
import { cn } from "@/lib/utils";

// icons
import { Bot, ChartCandlestick, ChartSpline, Send } from "lucide-react";

// axios
import axios from "axios";

// hooks
import { useAccount } from "wagmi";

// types
import { Agent } from "@/types";
import generateId from "@/lib/uuid";

// Añadimos el componente TypewriterEffect
const TypewriterEffect = ({
  text,
  speed = 30,
  onComplete,
  scrollRef,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);

        // Scroll mientras se escribe
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, speed);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      // Ocultamos el cursor después de un breve retraso
      setTimeout(() => setShowCursor(false), 500);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, isComplete, onComplete, scrollRef]);

  // Reiniciar cuando cambie el texto
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
    setShowCursor(true);
  }, [text]);

  return (
    <span>
      {displayedText}
      {showCursor && <span className="animate-pulse">▌</span>}
    </span>
  );
};

enum ResponseTokenDeployerAgent {
  TOKEN_ALREADY_CREATED = "TOKEN_ALREADY_CREATED",
  AWAIT_CONFIRMATION_FOR_TOKEN_DEPLOY = "AWAIT_CONFIRMATION_FOR_TOKEN_DEPLOY",
}

export function ChatWithOwnAgent({
  agent,
  refetchAgent,
}: {
  agent: Agent;
  refetchAgent?: () => void;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const { data: session } = useSession();
  const hasShownPaymentMessage = useRef(false);

  const { address, isConnected } = useAccount();
  const isTokenDeployer = agent.name === "token-deployer";

  const [isLoading, setIsLoading] = useState(false);
  const [llmModelToUse, setLlmModelToUse] = useState<
    "gemini-2.5" | "gemini-2.0-fn"
  >("gemini-2.5");
  const [chatHistory, setChatHistory] = useState<
    Array<{
      role: "user" | "userAgent";
      content: string;
      isVisible?: boolean;
      isThinking?: boolean;
      shouldAnimate?: boolean;
      isError?: boolean;
    }>
  >([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    setIsMounted(true);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    if (!localStorage.getItem("chatHistoryTimestamp")) {
      localStorage.setItem("chatHistoryTimestamp", Date.now().toString());
    }
  }, [chatHistory, isMounted]);

  const id = generateId();

  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const [isLlmModelDropdownOpen, setIsLlmModelDropdownOpen] = useState(false);

  const toggleLlmModelDropdown = useCallback(() => {
    setIsLlmModelDropdownOpen((prev) => !prev);
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
        shouldAnimate: false,
      },
      {
        role: "userAgent",
        content: "Thinking",
        isVisible: true,
        isThinking: true,
        shouldAnimate: false,
      },
    ]);

    // Scroll después de agregar el mensaje del usuario
    setTimeout(handleScroll, 100);

    if (isAwaitingConfirmation) {
      // Wait 10 seconds before sending the message to the agent
      const wait = new Promise((resolve) => setTimeout(resolve, 10000));
      await wait;
      setIsAwaitingConfirmation(false);
      setShowConfirmationModal(false);
    }

    let messageToSend = message;

    const contextHistory = chatHistory
      .filter((msg) => !msg.isThinking)
      .map(
        (msg) => `${msg.role === "user" ? "User" : " Agent"}: ${msg.content}`
      )
      .join("\n");

    messageToSend = `Context history:\n${contextHistory}\n\nNew message: ${message}`;

    if (agent.name === "token-deployer") {
      // get agent name from url params
      const pathname = window.location.pathname;
      const agentName = pathname.split("/")[2];

      if (agentName) {
        messageToSend = `message: ${messageToSend}, agent name: ${agentName}`;
      }
    }

    try {
      const response = await axios.post(`/api/message-agent`, {
        message: messageToSend,
        userId: address || id,
        agentId: agent.agentId,
        llmModelToUse,
      });
      console.log("response", response);

      setChatHistory((prev) =>
        prev.slice(0, -1).concat({
          role: "userAgent",
          content: response.data[0].text,
          isVisible: true,
          shouldAnimate: true,
        })
      );

      if (
        agent.name === "token-deployer" &&
        response.data[0].action ===
          ResponseTokenDeployerAgent.AWAIT_CONFIRMATION_FOR_TOKEN_DEPLOY
      ) {
        setIsAwaitingConfirmation(true);
        setShowConfirmationModal(true);
      }

      if (
        agent.name === "token-deployer" &&
        response.data[0].action ===
          ResponseTokenDeployerAgent.TOKEN_ALREADY_CREATED &&
        refetchAgent
      ) {
        refetchAgent();

        // Mostrar el modal y guardar la dirección del token
        if (response.data[0].metadata.tokenAddress) {
          setTokenAddress(response.data[0].metadata.tokenAddress);
          setShowTokenModal(true);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Verificar si es un error 504 (Gateway Timeout)
      if (axios.isAxiosError(error) && error.response?.status === 504) {
        setChatHistory((prev) =>
          prev.slice(0, -1).concat({
            role: "userAgent",
            content: "The agent is processing parallel actions which takes more than 1 minute. In the meantime, you can continue requesting grants through our other channels like Telegram, Twitter, or Farcaster.",
            isVisible: true,
            shouldAnimate: true,
            isError: true
          })
        );
      } else {
        // Para otros errores, mantener el mensaje genérico
        setChatHistory((prev) =>
          prev.slice(0, -1).concat({
            role: "userAgent",
            content: "Sorry, there was an error processing your request.",
            isVisible: true,
            shouldAnimate: true,
            isError: true
          })
        );
      }
    } finally {
      setIsLoading(false);
      setMessage("");
      // No necesitamos llamar a handleScroll aquí porque la animación se encargará del scroll
    }
  };

  const handleResetChat = async () => {
    localStorage.removeItem("chatHistory");
    localStorage.removeItem("chatHistoryTimestamp");
    hasShownPaymentMessage.current = false;

    setChatHistory([]);

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

  const handleConfirmDeploy = () => {
    handleTalkWithAgent("Yes, I confirm the token deployment");
  };

  const handleCancelDeploy = () => {
    handleTalkWithAgent("Cancel the token deployment");
    setIsAwaitingConfirmation(false);
    setShowConfirmationModal(false);
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
          {/* {agent.name === "jessexbt" && (
            <div className="group absolute right-8">
              <button
                className="bg-[#333333] text-white px-4 py-2 rounded-xl flex items-center transition-all duration-300 hover:bg-[#444444]"
                onClick={toggleLlmModelDropdown}
                onMouseEnter={() => setIsLlmModelDropdownOpen(true)}
                onMouseLeave={() => setIsLlmModelDropdownOpen(false)}
              >
                <Bot size={16} className="mr-2" />
                <p>Switch LLM Model: {llmModelToUse}</p>
              </button>

              <div
                className={`absolute right-0 mt-2 w-full bg-white text-black rounded-xl shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 overflow-hidden z-50 ${
                  isLlmModelDropdownOpen
                    ? "visible opacity-100"
                    : "invisible opacity-0"
                }`}
              >
                {["gemini-2.5", "gemini-2.0-fn"].map((model, index) => (
                  <button
                    className="w-full px-4 py-2 text-center hover:bg-sky-500/20"
                    onClick={() =>
                      setLlmModelToUse(model as "gemini-2.5" | "gemini-2.0-fn")
                    }
                    key={index}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
          )} */}
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`flex items-start mt-4 w-max md:max-w-60 lg:max-w-72 xl:max-w-md space-x-4 ${
                chat.role === "userAgent" ? "" : "justify-end ml-auto"
              } transition-all duration-500 transform ${
                chat.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
            >
              {chat.role === "userAgent" && (
                <div className="relative w-8 h-8">
                  <div
                    className={cn(
                      "absolute inset-0 bg-white/50 blur-lg",
                      isTokenDeployer && "bg-yellow-600/50",
                      chat.isError && "bg-red-600/50"
                    )}
                  />
                  <div
                    className={cn(
                      "relative w-full h-full rounded-lg bg-black/20 border border-white flex items-center justify-center backdrop-blur-sm",
                      isTokenDeployer && "!border-yellow-400",
                      chat.isError && "!border-red-300"
                    )}
                  >
                    <Bot
                      className={cn(
                        "w-4 h-4 text-white",
                        isTokenDeployer && "!text-yellow-400",
                        chat.isError && "!text-red-300"
                      )}
                    />
                  </div>
                </div>
              )}
              <div className="flex-1">
                <div
                  className={`px-4 flex items-center py-3 rounded-lg backdrop-blur-sm ${
                    chat.role === "userAgent"
                      ? isTokenDeployer
                        ? "bg-yellow-600/5 border border-yellow-600"
                        : chat.isError
                        ? "bg-red-600/5 border border-red-300"
                        : "bg-black/20 border border-white"
                      : "bg-white/20 border border-white"
                  }`}
                >
                  {chat.shouldAnimate ? (
                    <p
                      className={cn(
                        "max-md:text-sm text-white w-full break-words whitespace-pre-wrap"
                      )}
                    >
                      <TypewriterEffect
                        text={chat.content}
                        speed={20}
                        onComplete={() => {
                          // Cuando la animación termina, aseguramos que el scroll esté al final
                          setTimeout(handleScroll, 100);
                        }}
                        scrollRef={scrollContainerRef}
                      />
                    </p>
                  ) : (
                    <p
                      className={cn(
                        "max-md:text-sm text-white w-full break-words whitespace-pre-wrap"
                      )}
                      dangerouslySetInnerHTML={{
                        __html: chat.content.replace(/\n/g, "<br/>"),
                      }}
                    />
                  )}

                  {chat.isThinking && (
                    <span className="inline-flex ml-1 text-white">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showTokenModal && (
        <div className="px-6 py-4 bg-green-900/30 border border-green-500 rounded-lg mx-6 mb-2 animate-fadeIn">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-green-400 font-medium">
                Token successfully created!
              </h3>

              <button
                onClick={() => setShowTokenModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://basescan.org/token/${tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-black/30 hover:bg-black/50 border border-white/20 rounded-lg text-sm text-white flex items-center gap-1 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View on BaseScan
              </a>

              <a
                href={`https://www.clanker.world/token/${tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-black/30 hover:bg-black/50 border border-white/20 rounded-lg text-sm text-white flex items-center gap-1 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                View on Clanker
              </a>

              <a
                href={`https://dexscreener.com/base/${tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-black/30 hover:bg-black/50 border border-white/20 rounded-lg text-sm text-white flex items-center gap-1 transition-colors"
              >
                <ChartCandlestick className="w-4 h-4" />
                View on DexScreener
              </a>

              {/* <a
                href={`/agent/${agent.name}?tokenView=1`}
                className="px-3 py-2 bg-black/30 hover:bg-black/50 border border-white/20 rounded-lg text-sm text-white flex items-center gap-1 transition-colors"
              >
                <ChartSpline className="w-4 h-4" />
                View on A0X
              </a> */}
            </div>
          </div>
        </div>
      )}

      {showConfirmationModal && (
        <div className="px-6 py-4 bg-black/80 border border-yellow-500 rounded-lg mx-6 mb-2 animate-fadeIn">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-yellow-400 font-medium">
                Confirmation for token deployment
              </h3>

              <button
                onClick={() => setShowConfirmationModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <p className="text-white text-sm">
              The agent is waiting for your confirmation to deploy the token. Do
              you want to continue?
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleConfirmDeploy}
                className="px-3 py-2 bg-black/30 hover:bg-green-600/20 border border-green-500 rounded-lg text-sm text-white flex items-center justify-center gap-1 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Confirm deployment
              </button>

              <button
                onClick={handleCancelDeploy}
                className="px-3 py-2 bg-black/30 hover:bg-red-600/20 border border-red-500 rounded-lg text-sm text-white flex items-center justify-center gap-1 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel deployment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-shrink p-6 w-full h-auto flex flex-col gap-2">
        <div className="relative w-full rounded-xl h-full min-h-[56px] max-h-[96px] bg-black/80 border border-white">
          <textarea
            ref={textareaRef}
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
      </div>
    </div>
  );
}
