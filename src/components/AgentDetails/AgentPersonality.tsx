"use client";

// react
import { useEffect, useState } from "react";

// next
import Link from "next/link";
import { useRouter } from "next/navigation";

// icons
import {
  BookOpen,
  Brain,
  Brush,
  Check,
  FileJson,
  Loader2,
  MessageCircle,
  MessageSquare,
  Pencil,
  Save,
  Trash,
  UserCircle,
  X,
} from "lucide-react";

// types
import { Agent, AgentPersonalityConfig, MessageExample } from "@/types";

// components
import EditableField from "./EditableField";

// wagmi
import { useAccount } from "wagmi";

// utils
import { cn } from "@/lib/utils";

// shadcn
import { useToast } from "@/components/shadcn/use-toast";

// components
import { ImportFile } from "./ImportFile";

interface AgentConfigProps {
  agent: Agent;
  from: "dashboard" | "personality-page";
  config: AgentPersonalityConfig;
  setConfig: (config: AgentPersonalityConfig) => void;
  originalPersonality: AgentPersonalityConfig;
  setOriginalPersonality: (personality: AgentPersonalityConfig) => void;
}

type T = string | string[] | MessageExample[][] | { [key: string]: string }[];

const compareArrays = (original: any, updated: any): any => {
  // Si ambos son null/undefined, no hay cambios
  if (!original && !updated) return null;

  // Si uno es null/undefined y el otro no, hay cambios
  if (!original || !updated) return updated || null;

  // Si son arrays, comparar sus longitudes y contenido
  if (Array.isArray(original) && Array.isArray(updated)) {
    if (original.length !== updated.length) return updated;
    if (JSON.stringify(original) !== JSON.stringify(updated)) return updated;
    return null;
  }

  // Para otros tipos de datos
  if (JSON.stringify(original) !== JSON.stringify(updated)) {
    return updated;
  }
  return null;
};

const getPersonalityChanges = (
  original: AgentPersonalityConfig,
  updated: AgentPersonalityConfig
): Partial<AgentPersonalityConfig> => {
  const changes: Partial<AgentPersonalityConfig> = {};

  // Compare system as string
  if (original.system !== updated.system) {
    changes.system = updated.system;
  }

  // Compare simple arrays
  const arrayFields: (keyof AgentPersonalityConfig)[] = [
    "bio",
    "lore",
    "knowledge",
    "topics",
    "postExamples",
    "adjectives",
  ];

  arrayFields.forEach((field: keyof AgentPersonalityConfig) => {
    const diff = compareArrays(original[field], updated[field]);
    if (diff) changes[field] = diff;
  });

  // Compare style object
  const styleChanges: Partial<typeof original.style> = {};
  const styleFields: (keyof typeof original.style)[] = ["all", "chat", "post"];

  styleFields.forEach((field) => {
    const diff = compareArrays(original.style[field], updated.style[field]);
    if (diff) styleChanges[field] = diff;
  });

  if (Object.keys(styleChanges).length > 0) {
    changes.style = {
      all: original.style.all,
      chat: original.style.chat,
      post: original.style.post,
      ...styleChanges,
    };
  }

  // Compare message examples
  if (
    JSON.stringify(original.messageExamples) !==
    JSON.stringify(updated.messageExamples)
  ) {
    changes.messageExamples = updated.messageExamples;
  }

  return changes;
};

const savePersonalityChanges = async (
  changedFields: Partial<AgentPersonalityConfig>,
  handle: string
) => {
  const response = await fetch(`/api/personality-agent`, {
    method: "PATCH",
    body: JSON.stringify({
      personality: changedFields,
      handle,
    }),
  });
  return response.json();
};

export function AgentPersonality({
  agent,
  from,
  config,
  setConfig,
  originalPersonality,
  setOriginalPersonality,
}: AgentConfigProps) {
  const [step, setStep] = useState(0);
  const [editableIndex, setEditableIndex] = useState<string | null>(null);
  const [addableIndex, setAddableIndex] = useState<string | null>(null);
  const [addableValue, setAddableValue] = useState<string>("");
  const router = useRouter();
  const { address } = useAccount();

  const cardHoverDashboard =
    "hover:border-green-500/50 hover:shadow-[0_0_0_1px_rgba(59,230,106,0.1),0_8px_20px_rgba(59,230,106,0.1)]";
  const cardHoverPersonalityPage =
    "hover:from-blue-50/50 hover:to-white hover:border-blue-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_8px_20px_rgba(59,130,246,0.1)]";

  const themes = {
    dashboard: {
      container: "flex-col bg-transparent",
      tabs: "flex w-full gap-2",
      tabActive:
        "rounded-lg bg-black/20 rounded-lg border border-green-500/50 text-green-500",
      tabInactive:
        "hover:bg-gray-900/10 rounded-lg text-gray-100 hover:text-green-600",
      tabIconActive: "text-green-500",
      tabIconInactive: "text-gray-100 group-hover:text-green-600",
      card: "bg-transparent border border-gray-100/10 " + cardHoverDashboard,
      textTitles: "text-gray-100",
      containerChat:
        "bg-transparent border border-green-500/50 " + cardHoverDashboard,
      cardChatAgent:
        "bg-gradient-to-r from-gray-900/20 to-black border border-gray-100",
      cardChatUser:
        "bg-gradient-to-r from-green-900/10 to-black border border-blue-100",
      input:
        "border-green-500/50 text-gray-100 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 bg-transparent",
    },
    "personality-page": {
      container: "flex-col bg-transparent",
      tabs: "flex w-full",
      tabActive:
        "bg-blue-500/10 text-blue-600 rounded-b-lg border border-blue-100 p-4",
      tabInactive:
        "hover:bg-gray-50 text-gray-700 hover:text-blue-600 rounded-b-lg p-4 border border-transparent",
      tabIconActive: "text-blue-500",
      tabIconInactive: "text-gray-700",
      card:
        "from-gray-50 to-white border border-gray-100 mb-3 last:mb-0 " +
        cardHoverPersonalityPage,
      cardPost:
        "bg-gradient-to-r from-gray-50 to-white border border-gray-100 " +
        cardHoverPersonalityPage,
      textTitles: "text-gray-900",
      containerChat:
        "bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:from-blue-50/50 hover:to-white hover:border-blue-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_8px_20px_rgba(59,130,246,0.1)]",
      cardChatAgent:
        "bg-gradient-to-r from-gray-50 to-white border border-gray-100",
      cardChatUser:
        "bg-gradient-to-r from-blue-50 to-white border border-blue-100",
      input:
        "border-gray-200 text-gray-900 focus:border-blue-200 focus:ring-1 focus:ring-blue-200",
    },
  };

  const [isOwner, setIsOwner] = useState(false);
  const [editingMessageIndex, setEditingMessageIndex] = useState<string | null>(
    null
  );
  const [editingMessageText, setEditingMessageText] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSuccess, setIsSavingSuccess] = useState(false);
  const [editingBadgeValue, setEditingBadgeValue] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    if (agent.creatorAddress) {
      if (Array.isArray(agent.creatorAddress)) {
        setIsOwner(
          agent.creatorAddress.some((addr) => {
            if (typeof addr === "string") {
              return address?.toLowerCase() === addr.toLowerCase();
            }
            return false;
          })
        );
      } else {
        const creatorAddressString = String(agent.creatorAddress);
        setIsOwner(
          address?.toLowerCase() === creatorAddressString.toLowerCase()
        );
      }
    }
  }, [address, agent]);

  const handleSave = async (useToast: boolean = false) => {
    setIsSaving(true);
    try {
      if (!isOwner) {
        console.error("You are not the owner of this agent");
        return;
      }

      const changedFields = getPersonalityChanges(originalPersonality, config);

      if (Object.keys(changedFields).length === 0) {
        if (useToast) {
          toast({
            title: "No changes detected",
            description: "No changes were made to the configuration",
            variant: "default",
            className:
              "bg-brand-primary/80 border border-brand-border backdrop-blur-sm text-white",
            duration: 3000,
          });
        }
        return;
      }

      console.log("Sending only changed fields:", changedFields);
      const data = await savePersonalityChanges(changedFields, agent.name);

      if (data.status === 200) {
        toast({
          title: "Configuration saved",
          description: "Your changes have been saved successfully",
          variant: "default",
          className:
            "bg-brand-primary/80 border border-brand-border backdrop-blur-sm text-white",
          duration: 3000,
        });
        setOriginalPersonality({
          ...originalPersonality,
          ...changedFields,
        });
        setIsSavingSuccess(true);
        setTimeout(() => {
          setIsSavingSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error saving personality:", error);
      if (useToast) {
        toast({
          title: "Error saving",
          description: "Failed to save changes. Please try again.",
          variant: "destructive",
          className:
            "bg-rose-500/80 border border-rose-500/30 backdrop-blur-sm text-white",
          duration: 3000,
        });
      }
    } finally {
      setIsSaving(false);
    }
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

  const processedMessageExamples = config.messageExamples.map((example) => {
    if (typeof example === "string") {
      try {
        return JSON.parse(example);
      } catch (e) {
        console.error("Error parsing message example:", e);
        return example;
      }
    }
    return example;
  });

  const groupedConversations: Record<string | number, MessageExample[]> =
    processedMessageExamples.reduce((acc, message) => {
      const conversationId = message._conversationId;

      if (!acc[conversationId]) {
        acc[conversationId] = [];
      }

      acc[conversationId].push(message);
      return acc;
    }, {} as Record<string | number, MessageExample[]>);

  const updatedConfig = {
    ...config,
    messageExamples: processedMessageExamples,
    conversationArrays: processedMessageExamples,
  };

  const steps = [
    {
      title: "Profile",
      icon: UserCircle,
      component: (
        <div className="space-y-6">
          {[
            {
              label: "System",
              sublabel:
                "The system prompt for the agent, this is core to the agent's behavior",
              value: config.system,
              onChange: (value: string) => {
                setConfig({
                  ...config,
                  system: value,
                });
              },
              onDelete: (value: string) => {
                setConfig({
                  ...config,
                  system: "",
                });
              },
              isTextarea: true,
              isBadges: false,
            },
            {
              label: "Bio",
              sublabel:
                "The character's biography, background, life experiences and key personality traits",
              value: config.bio,
              onChange: (value: string, index?: number) => {
                if (index !== undefined) {
                  const newBio = [...config.bio];
                  newBio[index] = value;
                  setConfig({
                    ...config,
                    bio: newBio,
                  });
                } else {
                  setConfig({
                    ...config,
                    bio: [...config.bio, value],
                  });
                }
              },
              onDelete: (value: string) => {
                setConfig({
                  ...config,
                  bio: config.bio.filter((v) => v !== value),
                });
              },
              isTextarea: false,
              isBadges: true,
            },
            {
              label: "Lore",
              sublabel:
                "The agent's world, its history and the important events that have shaped it.",
              value: config.lore,
              onChange: (value: string, index?: number) => {
                if (index !== undefined) {
                  const newLore = [...config.lore];
                  newLore[index] = value;
                  setConfig({
                    ...config,
                    lore: newLore,
                  });
                } else {
                  setConfig({
                    ...config,
                    lore: config.lore.filter((v) => v !== value),
                  });
                }
              },
              onDelete: (value: string) => {
                setConfig({
                  ...config,
                  lore: config.lore.filter((v) => v !== value),
                });
              },
              isTextarea: false,
              isBadges: true,
            },
          ].map((field, index) => (
            <EditableField
              key={index}
              {...field}
              id={`${index}-${field.label}`}
              editableIndex={editableIndex}
              setEditableIndex={setEditableIndex}
              addableIndex={addableIndex}
              setAddableIndex={setAddableIndex}
              addableValue={addableValue}
              setAddableValue={setAddableValue}
              isOwner={isOwner}
              themes={themes}
              from={from}
              icon={field.label === "Bio" ? UserCircle : BookOpen}
              editingBadgeValue={editingBadgeValue}
              setEditingBadgeValue={setEditingBadgeValue}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Style",
      icon: Brush,
      component: (
        <div className="space-y-6">
          {[
            {
              label: "General Style",
              sublabel:
                "How the character communicates in general. Typical speech patterns, gestures and expressions.",
              value: config.style.all,
              onChange: (value: string, index?: number) => {
                if (index !== undefined) {
                  const newStyle = [...config.style.all];
                  newStyle[index] = value;
                  setConfig({
                    ...config,
                    style: {
                      ...config.style,
                      all: newStyle,
                    },
                  });
                } else {
                  setConfig({
                    ...config,
                    style: {
                      ...config.style,
                      all: [...config.style.all, value],
                    },
                  });
                }
              },
              onDelete: (value: string) => {
                setConfig({
                  ...config,
                  style: {
                    ...config.style,
                    all: config.style.all.filter((v) => v !== value),
                  },
                });
              },
              isTextarea: false,
              isBadges: true,
            },
            {
              label: "Chat Style",
              sublabel:
                "How the character behaves in conversations. Response patterns and specific chat mannerisms. ",
              value: config.style.chat,
              onChange: (value: string, index?: number) => {
                if (index !== undefined) {
                  const newStyle = [...config.style.chat];
                  newStyle[index] = value;
                  setConfig({
                    ...config,
                    style: {
                      ...config.style,
                      chat: newStyle,
                    },
                  });
                } else {
                  setConfig({
                    ...config,
                    style: {
                      ...config.style,
                      chat: [...config.style.chat, value],
                    },
                  });
                }
              },
              onDelete: (value: string) => {
                setConfig({
                  ...config,
                  style: {
                    ...config.style,
                    chat: config.style.chat.filter((v) => v !== value),
                  },
                });
              },
              isTextarea: false,
              isBadges: true,
            },
            {
              label: "Post Style",
              sublabel:
                "How the character writes longer posts or content. Formatting preferences and writing style.",
              value: config.style.post,
              onChange: (value: string, index?: number) => {
                if (index !== undefined) {
                  const newStyle = [...config.style.post];
                  newStyle[index] = value;
                  setConfig({
                    ...config,
                    style: {
                      ...config.style,
                      post: newStyle,
                    },
                  });
                } else {
                  setConfig({
                    ...config,
                    style: {
                      ...config.style,
                      post: [...config.style.post, value],
                    },
                  });
                }
              },
              onDelete: (value: string) => {
                setConfig({
                  ...config,
                  style: {
                    ...config.style,
                    post: config.style.post.filter((v) => v !== value),
                  },
                });
              },
              isTextarea: false,
              isBadges: true,
            },
          ].map((field, index) => (
            <EditableField
              key={index}
              {...field}
              id={`${index}-${field.label}`}
              editableIndex={editableIndex}
              setEditableIndex={setEditableIndex}
              addableIndex={addableIndex}
              setAddableIndex={setAddableIndex}
              addableValue={addableValue}
              setAddableValue={setAddableValue}
              isOwner={isOwner}
              themes={themes}
              from={from}
              icon={Brush}
              editingBadgeValue={editingBadgeValue}
              setEditingBadgeValue={setEditingBadgeValue}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Knowledge",
      icon: Brain,
      component: (
        <div className="space-y-6">
          {[
            {
              label: "Knowledge Base",
              value: config.knowledge,
              sublabel:
                "Knowledge base for the agent. Focus on relevant information and organize in digestible chunks.",
              onChange: (value: string, index?: number) => {
                if (index !== undefined) {
                  const newKnowledge = [...config.knowledge];
                  newKnowledge[index] = value;
                  setConfig({
                    ...config,
                    knowledge: newKnowledge,
                  });
                } else {
                  setConfig({
                    ...config,
                    knowledge: [...config.knowledge, value],
                  });
                }
              },
              onDelete: (value: string) => {
                setConfig({
                  ...config,
                  knowledge: config.knowledge.filter((v) => v !== value),
                });
              },
              isTextarea: false,
              isBadges: true,
            },
            {
              label: "Topics",
              value: config.topics,
              sublabel:
                "The list of topics that the character is familiar with or interested in",
              onChange: (value: string, index?: number) => {
                if (index !== undefined) {
                  const newTopics = [...config.topics];
                  newTopics[index] = value;
                  setConfig({
                    ...config,
                    topics: newTopics,
                  });
                } else {
                  setConfig({
                    ...config,
                    topics: [...config.topics, value],
                  });
                }
              },
              onDelete: (value: string) => {
                setConfig({
                  ...config,
                  topics: config.topics.filter((v) => v !== value),
                });
              },
              isTextarea: false,
              isBadges: true,
            },
          ].map((field, index) => (
            <EditableField
              key={index}
              {...field}
              id={`${index}-${field.label}`}
              editableIndex={editableIndex}
              setEditableIndex={setEditableIndex}
              addableIndex={addableIndex}
              setAddableIndex={setAddableIndex}
              addableValue={addableValue}
              setAddableValue={setAddableValue}
              isOwner={isOwner}
              themes={themes}
              from={from}
              icon={field.label === "Knowledge Base" ? Brain : BookOpen}
              editingBadgeValue={editingBadgeValue}
              setEditingBadgeValue={setEditingBadgeValue}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Messages",
      icon: MessageCircle,
      component: (
        <div className="space-y-6">
          <h3
            className={`text-lg font-medium flex items-center gap-2 ${themes[from].textTitles}`}
          >
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Message Examples
          </h3>
          <div className="space-y-4">
            {Array.isArray(updatedConfig.conversationArrays) &&
              updatedConfig.conversationArrays.map(
                (conversation, convIndex) => {
                  return (
                    <div
                      key={`conversation-${convIndex}`}
                      className={cn(
                        "p-4 rounded-xl transition-all duration-300",
                        themes[from].containerChat
                      )}
                    >
                      <div
                        className={cn(
                          "border-b  pb-2 mb-4 flex items-center justify-between",
                          from === "dashboard"
                            ? "border-green-500/50"
                            : "border-gray-100"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <span
                            className={`text-sm font-medium ${themes[from].textTitles}`}
                          >
                            Conversation {convIndex + 1}
                          </span>
                        </div>
                        {isOwner && (
                          <button
                            className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this conversation?"
                                )
                              ) {
                                const newMessageExamples = [
                                  ...updatedConfig.messageExamples,
                                ];
                                newMessageExamples.splice(convIndex, 1);
                                setConfig({
                                  ...config,
                                  messageExamples: newMessageExamples,
                                });
                              }
                            }}
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {Array.isArray(conversation) &&
                        conversation.map(
                          (message: MessageExample, index: number) => (
                            <div
                              key={`message-${convIndex}-${index}`}
                              className={`flex gap-3 relative mt-7 ${
                                message.user === agent.name ||
                                message.user === "character"
                                  ? "justify-start"
                                  : "justify-end"
                              }`}
                            >
                              <span
                                className={cn(
                                  "text-xs absolute -top-5",
                                  message.user === agent.name ||
                                    message.user === "character"
                                    ? "left-0"
                                    : "right-0",
                                  from === "personality-page"
                                    ? "text-gray-600"
                                    : "text-gray-400"
                                )}
                              >
                                {message.user}
                              </span>
                              <div
                                className={cn(
                                  "relative group max-w-[80%] p-3 rounded-xl",
                                  message.user === agent.name ||
                                    message.user === "character"
                                    ? themes[from].cardChatAgent // "bg-gradient-to-r from-gray-50 to-white border border-gray-100"
                                    : themes[from].cardChatUser, // "bg-gradient-to-r from-blue-50 to-white border border-blue-100",
                                  editingMessageIndex ===
                                    `${message._conversationId}-${index}` &&
                                    "w-full"
                                )}
                              >
                                {editingMessageIndex ===
                                `${message._conversationId}-${index}` ? (
                                  <div className="flex items-center gap-2 w-full">
                                    <input
                                      type="text"
                                      value={editingMessageText}
                                      onChange={(e) =>
                                        setEditingMessageText(e.target.value)
                                      }
                                      className={cn(
                                        "flex-1 p-2 rounded-lg border text-sm focus:outline-none",
                                        themes[from].input
                                      )}
                                      autoFocus
                                    />
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => {
                                          const newMessages = [
                                            ...updatedConfig.messageExamples,
                                          ];
                                          newMessages[convIndex][index] = {
                                            ...message,
                                            content: {
                                              text: editingMessageText,
                                            },
                                          };
                                          setConfig({
                                            ...config,
                                            messageExamples: newMessages,
                                          });
                                          setEditingMessageIndex(null);
                                        }}
                                        className="p-1 rounded hover:bg-green-50 text-green-600"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setEditingMessageIndex(null)
                                        }
                                        className="p-1 rounded hover:bg-red-50 text-red-500"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p
                                      className={cn(
                                        themes[from].textTitles,
                                        from === "personality-page"
                                          ? "text-gray-800 font-medium"
                                          : ""
                                      )}
                                    >
                                      {message.content?.text}
                                    </p>
                                    {isOwner && (
                                      <div
                                        className={cn(
                                          "absolute top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity group/editButton",
                                          message.user === agent.name ||
                                            message.user === "character"
                                            ? "-right-14"
                                            : "-left-14"
                                        )}
                                      >
                                        {/* Remove message */}
                                        <button
                                          className={cn(
                                            "opacity-0 group-hover:opacity-100 transition-opacity group/editButton",
                                            "p-1 rounded-full ",

                                            from === "dashboard"
                                              ? "hover:bg-rose-700/50"
                                              : "hover:bg-gray-100"
                                          )}
                                          onClick={() => {
                                            const newMessageExamples = [
                                              ...updatedConfig.messageExamples,
                                            ];
                                            newMessageExamples[
                                              convIndex
                                            ].splice(index, 1);
                                            setConfig({
                                              ...config,
                                              messageExamples:
                                                newMessageExamples,
                                            });
                                          }}
                                        >
                                          <Trash
                                            className={cn(
                                              "w-4 h-4 text-gray-400 group-hover/editButton:text-rose-500"
                                            )}
                                          />
                                        </button>
                                        <button
                                          className={cn(
                                            "opacity-0 group-hover:opacity-100 transition-opacity group/editButton",
                                            "p-1 rounded-full ",
                                            from === "dashboard"
                                              ? "hover:bg-green-700/50"
                                              : "hover:bg-gray-100"
                                          )}
                                          onClick={() => {
                                            setEditingMessageText(
                                              message.content?.text || ""
                                            );
                                            setEditingMessageIndex(
                                              `${message._conversationId}-${index}`
                                            );
                                          }}
                                        >
                                          <Pencil
                                            className={cn(
                                              "w-4 h-4 text-gray-400 ",
                                              from === "dashboard"
                                                ? "group-hover/editButton:text-green-500"
                                                : "group-hover/editButton:text-blue-500"
                                            )}
                                          />
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      {isOwner && (
                        <button
                          onClick={() => {
                            const currentConversation =
                              updatedConfig.messageExamples[convIndex];
                            if (
                              currentConversation &&
                              currentConversation.length > 0
                            ) {
                              const lastMessage =
                                currentConversation[
                                  currentConversation.length - 1
                                ];

                              const newMessage: MessageExample = {
                                _conversationId: convIndex,
                                _messageIndex: currentConversation.length,
                                content: { text: "New message" },
                                user:
                                  lastMessage.user === agent.name
                                    ? "user"
                                    : agent.name,
                              };

                              const newMessageExamples = [
                                ...updatedConfig.messageExamples,
                              ];
                              newMessageExamples[convIndex] = [
                                ...currentConversation,
                                newMessage,
                              ];
                              setConfig({
                                ...config,
                                messageExamples: newMessageExamples,
                              });
                            }
                          }}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium transition-colors mt-4",
                            from === "personality-page"
                              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                              : "text-green-500 border border-green-500/50 hover:bg-green-500/10 bg-transparent"
                          )}
                        >
                          Add Message
                        </button>
                      )}
                    </div>
                  );
                }
              )}
          </div>
          {isOwner && (
            <div
              className={cn(
                "pt-4 border-t ",
                from === "personality-page"
                  ? "border-gray-100"
                  : "border-gray-100/10"
              )}
            >
              <button
                onClick={() => {
                  setConfig({
                    ...config,
                    messageExamples: [
                      ...updatedConfig.messageExamples,
                      [
                        {
                          user: "user",
                          _conversationId: updatedConfig.messageExamples.length,
                          _messageIndex: 0,
                          content: { text: "New conversation" },
                        },
                        {
                          user: agent.name,
                          _conversationId: updatedConfig.messageExamples.length,
                          _messageIndex: 1,
                          content: { text: "New conversation" },
                        },
                      ],
                    ],
                  });
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium  transition-colors",
                  from === "personality-page"
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                    : "text-green-500 border border-green-500/50 hover:bg-green-500/10 bg-transparent"
                )}
              >
                Add Conversation
              </button>
            </div>
          )}
          {[
            {
              label: "Post Examples",
              value: config.postExamples,
              sublabel:
                "Examples of the character's posts or content. This helps the agent understand the character's writing style and tone.",
              onChange: (value: string, index?: number) => {
                if (index !== undefined) {
                  const newPostExamples = [...config.postExamples];
                  newPostExamples[index] = value;
                  setConfig({
                    ...config,
                    postExamples: newPostExamples,
                  });
                } else {
                  setConfig({
                    ...config,
                    postExamples: [...config.postExamples, value],
                  });
                }
              },
              onDelete: (value: string) => {
                setConfig({
                  ...config,
                  postExamples: config.postExamples.filter((v) => v !== value),
                });
              },
              isTextarea: false,
              isBadges: true,
            },
          ].map((field, index) => (
            <EditableField
              key={index}
              {...field}
              id={`${index}-${field.label}`}
              editableIndex={editableIndex}
              setEditableIndex={setEditableIndex}
              addableIndex={addableIndex}
              setAddableIndex={setAddableIndex}
              addableValue={addableValue}
              setAddableValue={setAddableValue}
              isOwner={isOwner}
              themes={themes}
              from={from}
              icon={MessageCircle}
              editingBadgeValue={editingBadgeValue}
              setEditingBadgeValue={setEditingBadgeValue}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Import File",
      icon: FileJson,
      component: <ImportFile config={config} setConfig={setConfig} />,
    },
    // {
    //   title: "Memories",
    //   icon: SquareStack,
    //   component: (
    //     <div className="flex flex-col items-center justify-center h-full">
    //       <div className="text-center">
    //         <SquareStack className="w-12 h-12 text-gray-400 group-hover:text-blue-400 transition-colors" />
    //       </div>
    //     </div>
    //   ),
    // },
  ];

  const stepsToDashboard = [...steps];
  stepsToDashboard.pop();

  return (
    <div className={cn(from === "personality-page" ? "" : "w-full pb-4")}>
      <div
        className={cn(
          "rounded-xl overflow-hidden",
          from === "personality-page" && "glassmorphism"
        )}
      >
        <div className={cn("flex", themes[from].container)}>
          <div className={cn("border-r border-gray-200/5", themes[from].tabs)}>
            {(from === "dashboard" ? stepsToDashboard : steps).map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  handleSave(false);
                  setStep(i);
                  setEditableIndex(null);
                  setEditingMessageIndex(null);
                  setAddableIndex(null);
                }}
                className={`w-full flex items-center gap-3 p-3 text-left transition-all duration-300 mb-2 group ${
                  step === i ? themes[from].tabActive : themes[from].tabInactive
                }`}
              >
                <s.icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    step === i
                      ? themes[from].tabIconActive
                      : themes[from].tabIconInactive
                  } group-hover:${themes[from].tabIconActive}`}
                />

                <span className="font-medium">{s.title}</span>
                {(editingMessageIndex || editableIndex) && step === i && (
                  <span className="text-sm text-green-500 animate-pulse">
                    ●
                  </span>
                )}
              </button>
            ))}
          </div>

          <div
            className={cn(
              "flex-1 flex flex-col",
              from === "personality-page" && "min-h-[calc(100vh-16rem)]"
            )}
          >
            <div
              className={cn(
                "flex-1 overflow-y-auto",
                from === "personality-page" ? "p-6 space-y-6" : "p-4"
              )}
            >
              {isOwner && from === "personality-page" && (
                <div className="border-t border-gray-200/5 flex items-center justify-end">
                  <button
                    onClick={() => handleSave(true)}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r  transition-all duration-200 flex items-center gap-2",
                      isSaving
                        ? "opacity-50 cursor-not-allowed from-blue-500 via-blue-600 to-blue-500"
                        : "from-blue-500 via-blue-600 to-blue-500 hover:from-blue-600 hover:via-blue-700 hover:to-blue-600",
                      isSavingSuccess
                        ? "bg-green-500/50"
                        : "from-blue-500 via-blue-600 to-blue-500 hover:from-blue-600 hover:via-blue-700 hover:to-blue-600"
                    )}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isSavingSuccess ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSaving
                      ? "Saving..."
                      : isSavingSuccess
                      ? "Saved"
                      : "Save Configuration"}
                  </button>
                </div>
              )}

              {steps[step].component}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
