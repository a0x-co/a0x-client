// react
import React, { useState, useRef, useEffect } from "react";

// next
import Image from "next/image";

// lucide
import {
  X,
  Send,
  Image as ImageIcon,
  Link as LinkIcon,
  Bot,
  Loader,
  Twitter,
  Check,
  AlertCircle,
  History,
  Plus,
  Trash,
  User,
} from "lucide-react";

// utils
import { cn } from "@/lib/utils";

// next auth
import { useSession } from "next-auth/react";

// axios
import axios from "axios";
import { useAccount } from "wagmi";

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
  attachments?: {
    type: "image" | "url";
    url: string;
  }[];
  suggestedTweet?: {
    content: string;
    status: "pending" | "approved" | "posted" | "rejected";
  };
}

interface Chat {
  id: string;
  messages: Message[];
  createdAt: Date;
}

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentAvatar: string;
  agentEndpoint: string;
  agentId: string;
}

const STORAGE_KEY = "agent_chat_history";

const evaluateTweetNeeded = async (message: string) => {
  const array = [
    "tweet",
    "post",
    "share",
    "share on twitter",
    "share on x",
    "twitter",
    "x",
  ];
  if (array.some((word) => message.toLowerCase().includes(word))) {
    return true;
  }
  return false;
};

export function ComposeModal({
  isOpen,
  onClose,
  agentName,
  agentAvatar,
  agentEndpoint,
  agentId,
}: ComposeModalProps) {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>(() => {
    return [
      {
        id: "default",
        messages: [],
        createdAt: new Date(),
      },
    ];
  });
  const [currentChatId, setCurrentChatId] = useState("default");
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<
    { type: "image" | "url"; url: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();

  if (!isOpen) return null;

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const handleNewChat = () => {
    if (currentChat?.messages.length === 0) {
      setShowHistory(true);
      return;
    }
    const newChat: Chat = {
      id: Date.now().toString(),
      messages: [],
      createdAt: new Date(),
    };
    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(newChat.id);
  };

  const handleTweetAction = (
    messageId: string,
    action: "approve" | "reject" | "post"
  ) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: chat.messages.map((msg) => {
              if (msg.id === messageId && msg.suggestedTweet) {
                return {
                  ...msg,
                  suggestedTweet: {
                    ...msg.suggestedTweet,
                    status:
                      action === "approve"
                        ? "approved"
                        : action === "post"
                        ? "posted"
                        : "rejected",
                  },
                };
              }
              return msg;
            }),
          };
        }
        return chat;
      })
    );

    if (action === "post") {
      setTimeout(() => {
        const message = messages.find((m) => m.id === messageId);
        if (message?.suggestedTweet) {
          const responseMessage: Message = {
            id: Date.now().toString(),
            type: "agent",
            content: "Tweet posted successfully! 🎉",
            timestamp: new Date(),
          };
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.id === currentChatId
                ? { ...chat, messages: [...chat.messages, responseMessage] }
                : chat
            )
          );
          scrollToBottom();
        }
      }, 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
      attachments,
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );
    setInput("");
    setAttachments([]);
    setIsLoading(true);
    scrollToBottom();

    /* Evaluate if a tweet is needed */
    const isTweetNeeded = await evaluateTweetNeeded(input);

    /* Flow 0: If tweet is needed */
    if (isTweetNeeded) {
      const contentWithTweetRequest = `I want to tweet about ${input} ${
        attachments.length > 0 ? "and attachments" : ""
      }, please suggest a tweet. IMPORTANT: Only return the tweet, no other text, comments. Maximum 280 characters.`;
      try {
        const response = await axios.post(`/api/message-agent`, {
          message: contentWithTweetRequest,
          walletAddress: address || "",
          endpoint: `${agentEndpoint}/${agentId}/message`,
        });
        const responseData = response.data.simulatedResponse;
        const cleanResponse = responseData.replace(/^"|"$/g, "");
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "agent",
          content: `I've analyzed your message${
            attachments.length > 0 ? " and attachments" : ""
          }. Here's a suggested tweet:`,
          timestamp: new Date(),
          suggestedTweet: {
            content: `${cleanResponse.slice(0, 280)}${
              cleanResponse.length > 280 ? "..." : ""
            }`,
            status: "pending",
          },
        };
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, agentMessage] }
              : chat
          )
        );
        scrollToBottom();
      } catch (error) {
        console.error("Error simulating response:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      /* Flow 1: Chat with agent */
      try {
        // Crear el mensaje con contexto
        const response = await axios.post(`/api/message-agent`, {
          message: input,
          walletAddress: address || "",
          endpoint: `${agentEndpoint}/${agentId}/message`,
        });

        const responseData = response.data.simulatedResponse;
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "agent",
          content: responseData,
          timestamp: new Date(),
        };

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, agentMessage] }
              : chat
          )
        );
        scrollToBottom();
      } catch (error) {
        console.error("Error simulating response:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server and get a URL back
      const fakeImageUrl =
        "https://images.unsplash.com/photo-1635372722656-389f87a941b7";
      setAttachments((prev) => [...prev, { type: "image", url: fakeImageUrl }]);
    }
  };

  const handleDelete = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId("default");
      setShowHistory(false);
    }
    if (chats.length === 1) {
      const newChat: Chat = {
        id: "default",
        messages: [],
        createdAt: new Date(),
      };
      setChats([newChat]);
      setCurrentChatId("default");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full h-[80vh] rounded-[24px] border border-white/[0.08] bg-black/20 backdrop-blur-xl backdrop-saturate-150 overflow-hidden transition-all duration-400 max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-white/80" />
              <h3 className="text-lg font-medium text-white">{agentName}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 hover:bg-white/[0.02] rounded-xl transition-colors text-white/80"
                title="Chat History"
              >
                <History className="w-5 h-5" />
              </button>
              <button
                onClick={handleNewChat}
                className="p-2 hover:bg-white/[0.02] rounded-xl transition-colors text-white/80"
                title="New Chat"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/[0.02] rounded-xl transition-colors text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex h-[calc(80vh-8.5rem)]",
            attachments.length > 0 && "h-[calc(80vh-12rem)]"
          )}
        >
          {showHistory && (
            <div className="w-64 border-r border-white/[0.08] overflow-y-auto bg-black/20">
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">
                  Chat History
                </h4>
                <div className="space-y-2">
                  {chats
                    .sort(
                      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                    )
                    .map((chat) => (
                      <div key={chat.id} className="flex justify-between">
                        <button
                          onClick={() => {
                            setCurrentChatId(chat.id);
                            setShowHistory(false);
                          }}
                          className={`w-full p-2 rounded-lg text-left transition-colors ${
                            chat.id === currentChatId
                              ? "bg-blue-500/20 text-blue-400"
                              : "hover:bg-gray-700/50 text-gray-300"
                          }`}
                        >
                          <div className="text-sm font-medium truncate">
                            Chat{" "}
                            {chat.messages.length > 0
                              ? `(${chat.messages.length} messages)`
                              : "(New)"}
                          </div>
                          <div className="text-xs opacity-60">
                            {chat.createdAt.toLocaleDateString()}
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            if (chat.messages.length > 0) {
                              handleDelete(chat.id);
                            }
                          }}
                          className="ml-2 p-2 text-red-500 hover:bg-red-500/20 rounded-lg"
                          title="Delete Chat"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex-1 flex flex-col bg-black/10">
            <div
              ref={chatContainerRef}
              className={cn(
                "flex flex-col gap-4 p-4  overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-800"
              )}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    {message.type === "agent" ? (
                      <Image
                        src={agentAvatar}
                        alt={message.type === "agent" ? "Agent" : "User"}
                        className="w-full h-full object-cover"
                        width={32}
                        height={32}
                      />
                    ) : (
                      <User className="w-full h-full text-gray-400 border-2 border-gray-400 rounded-full" />
                    )}
                  </div>
                  <div className="space-y-2 max-w-[70%]">
                    <div
                      className={`p-3 rounded-lg ${
                        message.type === "user"
                          ? "bg-blue-500/20 ml-auto"
                          : "bg-gray-800/50"
                      }`}
                    >
                      {message.attachments?.map((attachment, index) => (
                        <div key={index} className="mb-2">
                          {attachment.type === "image" ? (
                            <Image
                              src={attachment.url}
                              alt="Attachment"
                              className="rounded-lg max-h-48 object-cover"
                              width={100}
                              height={100}
                            />
                          ) : (
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 break-all"
                            >
                              {attachment.url}
                            </a>
                          )}
                        </div>
                      ))}
                      <p className="text-white">{message.content}</p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {`${message.timestamp
                          .getDate()
                          .toString()
                          .padStart(2, "0")}/${(
                          message.timestamp.getMonth() + 1
                        )
                          .toString()
                          .padStart(
                            2,
                            "0"
                          )} ${message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`}
                      </span>
                    </div>

                    {message.suggestedTweet && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Twitter className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-blue-400">
                            Suggested Tweet
                          </span>
                        </div>
                        <p className="text-white text-sm mb-3">
                          {message.suggestedTweet.content}
                        </p>
                        {message.suggestedTweet.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleTweetAction(message.id, "approve")
                              }
                              className="flex-1 py-1 px-3 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleTweetAction(message.id, "reject")
                              }
                              className="flex-1 py-1 px-3 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {message.suggestedTweet.status === "approved" && (
                          <button
                            onClick={() =>
                              handleTweetAction(message.id, "post")
                            }
                            className="w-full py-1 px-3 rounded bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm transition-colors flex items-center justify-center gap-2"
                          >
                            <Twitter className="w-4 h-4" />
                            Post Tweet
                          </button>
                        )}
                        {message.suggestedTweet.status === "posted" && (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <Check className="w-4 h-4" />
                            Tweet posted successfully
                          </div>
                        )}
                        {message.suggestedTweet.status === "rejected" && (
                          <div className="flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            Tweet rejected
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={agentAvatar}
                      alt="Agent"
                      className="w-full h-full object-cover"
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-gray-800/50 inline-flex items-center">
                    <Loader className="w-5 h-5 text-blue-400 animate-spin" />
                    <span className="ml-2 text-gray-300">Analyzing...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-white/[0.08] bg-black/20">
          {attachments.length > 0 && (
            <div className="flex gap-2 mb-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative group">
                  {attachment.type === "image" ? (
                    <Image
                      src={attachment.url}
                      alt="Attachment"
                      className="w-12 h-12 rounded object-cover"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center">
                      <LinkIcon className="w-6 h-6 text-blue-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 bg-black/20 border border-white/[0.08] rounded-full px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/20"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-white/[0.02] rounded-xl transition-colors text-white/80"
              title="Add image"
            >
              <ImageIcon className="w-6 h-6" />
            </button>
            <button
              type="submit"
              disabled={!input.trim() && attachments.length === 0}
              className="p-2 rounded-xl bg-white text-gray-800 transition-all duration-200 
                         hover:bg-black hover:text-white hover:shadow-lg hover:shadow-blue-500/30"
            >
              <Send className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
