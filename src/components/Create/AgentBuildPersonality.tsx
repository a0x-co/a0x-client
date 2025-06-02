"use client";

// react
import { useCallback, useEffect, useRef, useState } from "react";

// next
import { useSession } from "next-auth/react";

// utils

// http client
import axios from "axios";

// icons
import { Bot } from "lucide-react";

// wagmi
import { useAccount } from "wagmi";

// types
import { PersonalityBuildActionTrigger } from "@/types";

export function AgentBuildPersonality() {
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const { data: session } = useSession();
  const { address } = useAccount();

  const [chatHistory, setChatHistory] = useState<
    Array<{
      role: "user" | "agent";
      content: string;
      isVisible?: boolean;
      action?: PersonalityBuildActionTrigger;
    }>
  >([
    {
      role: "agent",
      content:
        "Welcome! I'll help you build your agent's personality. Let's start with your agent's biography. Could you tell me about your agent?",
      isVisible: true,
      action: PersonalityBuildActionTrigger.ENTER_BIO,
    },
  ]);

  const MAX_VISIBLE_MESSAGES = 8;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement | null>(null);

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

  const handleTalkWithAgent = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: message, isVisible: true },
      ]);

      setMessage("");

      try {
        const response = await axios.post("/api/build-personality", {
          message: message,
          userAddress: address?.toLowerCase(),
        });

        const data = response.data;

        let parsedResponse: {
          message: string;
          action?: PersonalityBuildActionTrigger;
        };

        console.log(data.syntheticResponse);

        // Handle parse response
        try {
          parsedResponse = JSON.parse(data.syntheticResponse.message);
          setChatHistory((prev) => [
            ...prev,
            {
              role: "agent",
              content: parsedResponse.message,
              action: parsedResponse.action || data.syntheticResponse.action,
              isVisible: true,
            },
          ]);
        } catch (e) {
          setChatHistory((prev) => [
            ...prev,
            {
              role: "agent",
              content: data.syntheticResponse.message,
              action: data.syntheticResponse.action,
              isVisible: true,
            },
          ]);
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
    [address]
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTalkWithAgent(message);
    }
  };

  const handleResetChat = () => {
    setChatHistory([
      {
        role: "agent",
        content:
          "Welcome! I'll help you build your agent's personality. Let's start with your agent's biography. Could you tell me about your agent?",
        isVisible: true,
        action: PersonalityBuildActionTrigger.ENTER_BIO,
      },
    ]);
  };

  return (
    <div className="flex-1 overflow-hidden relativepx-4 sm:px-6 lg:px-8 py-16">
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto space-y-4 p-4"
      >
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex items-start w-max md:max-w-60 lg:max-w-72 xl:max-w-96 space-x-4 ${
              chat.role === "agent" ? "" : "justify-end ml-auto"
            } transition-all duration-500 transform ${
              chat.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4"
            }`}
          >
            {chat.role === "agent" && (
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-sky-800/50 blur-lg" />
                <div className="relative w-full h-full rounded-lg bg-white/20 border border-sky-800 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-4 h-4 text-sky-900/50" />
                </div>
              </div>
            )}
            <div className="flex-1">
              <div
                className={`px-4 py-3 rounded-lg backdrop-blur-sm bg-white/20 border border-sky-800`}
              >
                <p
                  className={`max-md:text-sm max-md:text-wrap max-md:w-40 text-sky-900`}
                  dangerouslySetInnerHTML={{
                    __html: chat.content.replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* <Model3D /> */}

      {/* <div className="sticky bottom-0 flex flex-col gap-4 max-w-4xl mx-auto z-10 pointer-events-none">
        {chatHistory[chatHistory.length - 1].action &&
          chatHistory[chatHistory.length - 1].action !==
            ActionTrigger.NO_ACTION_NEEDED && (
            <div
              className={cn(
                "p-4 w-full rounded-3xl bg-gradient-to-r from-sky-700/80 to-sky-800/80 border border-sky-800/80 mt-2 shadow-lg"
              )}
            >
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-sky-50" />
                <span className="text-sky-50 font-medium">
                  Current Step:{" "}
                  {chatHistory[chatHistory.length - 1]?.action
                    ?.split("_")
                    .join(" ")}
                </span>
              </div>
            </div>
          )}
        <div className="relative p-4 bg-black/10 rounded-3xl border-t border-gray-50 shadow-lg backdrop-blur-sm">
          <input
            type="text"
            placeholder="Type your response..."
            className="w-full px-6 py-4 rounded-xl bg-white border border-gray-200 text-gray-800 placeholder-gray-400/50 focus:outline-none focus:border-gray-400/50 transition-all duration-300 pointer-events-auto"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              className="p-2 rounded-xl hover:bg-red-500/10 transition-all duration-300 pointer-events-auto"
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
              className="p-2 rounded-xl hover:bg-sky-500/10 transition-all duration-300 pointer-events-auto"
              onClick={() => handleTalkWithAgent(message)}
            >
              <Send className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
}
