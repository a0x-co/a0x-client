import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { Agent, Conversation, ConversationByPlatform } from "@/types";
import {
  Bot,
  MessageSquare,
  Search,
  Star,
  User,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  MessageCircle,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";
import { FaTelegram, FaXTwitter } from "react-icons/fa6";
import FarcasterIcon from "../Icons/FarcasterIcon";
import { cn, parseConversationContext, parseMessage } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useToast } from "../shadcn/use-toast";

interface ConversationReviewProps {
  conversations: ConversationByPlatform;
  platform: "farcaster" | "twitter" | "telegram";
  //   onTagAdd: (conversationId: string, tag: string) => void;
  //   onTagRemove: (conversationId: string, tag: string) => void;
  onRatingChange: (conversationId: string, rating: number) => void;
  onFeedbackSubmit: (conversationId: string, feedback: string) => void;
  onPlatformChange?: (platform: "farcaster" | "twitter" | "telegram") => void;
  agent: Agent;
  refetchConversations: () => void;
}

interface ConversationFeedback {
  conversationId: string;
  rating?: number;
  feedback?: string;
}

interface ConversationsFeedback {
  agentId: string;
  conversations: ConversationFeedback[];
}

// Función para extraer el nombre de usuario del mensaje de Telegram
const extractTelegramUsername = (message: string): string | null => {
  const conversationContextMatch = message.match(
    /conversation between you and @([a-zA-Z0-9_]+)/
  );
  if (conversationContextMatch && conversationContextMatch[1]) {
    return conversationContextMatch[1];
  }
  return null;
};

export function ConversationReview({
  conversations,
  platform,
  onRatingChange,
  onFeedbackSubmit,
  onPlatformChange,
  agent,
  refetchConversations,
}: ConversationReviewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localRating, setLocalRating] = useState<number | null>(null);
  const [directFeedbackMessageId, setDirectFeedbackMessageId] = useState<string | null>(null);
  const [directFeedbackText, setDirectFeedbackText] = useState("");

  console.log("conversations", conversations);

  const { toast } = useToast();

  // Buscar el feedback existente para la conversación seleccionada
  const findExistingFeedback = (
    conversationId: string
  ): ConversationFeedback | null => {
    // Buscar la conversación seleccionada directamente en las conversaciones
    const existingConversation = conversations[platform].find(
      (conv) => conv.id === conversationId
    );

    if (!existingConversation) return null;

    // Crear un objeto ConversationFeedback con los datos de la conversación
    return {
      conversationId: existingConversation.id,
      rating: existingConversation.rating,
      feedback: existingConversation.feedback,
    };
  };

  const handleTagAdd = (conversationId: string) => {
    if (newTag.trim()) {
      // onTagAdd(conversationId, newTag.trim());
      setNewTag("");
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "farcaster":
        return <FarcasterIcon />;
      case "twitter":
        return <FaXTwitter className="w-4 h-4" />;
      case "telegram":
        return <FaTelegram className="w-4 h-4" />;
      default:
        return "💬";
    }
  };

  const handlePrevPlatform = () => {
    if (!onPlatformChange) return;

    if (platform === "twitter") {
      onPlatformChange("farcaster");
      setSelectedConversation(null);
    } else if (platform === "telegram") {
      onPlatformChange("twitter");
      setSelectedConversation(null);
    } else if (platform === "farcaster") {
      onPlatformChange("telegram");
      setSelectedConversation(null);
    }
  };

  const handleNextPlatform = () => {
    if (!onPlatformChange) return;

    if (platform === "twitter") {
      onPlatformChange("telegram");
      setSelectedConversation(null);
    } else if (platform === "telegram") {
      onPlatformChange("farcaster");
      setSelectedConversation(null);
    } else if (platform === "farcaster") {
      onPlatformChange("twitter");
      setSelectedConversation(null);
    }
  };

  // Verificar si existen conversaciones para la plataforma actual
  const hasConversations =
    conversations[platform] && conversations[platform].length > 0;
  const conversationsCount = hasConversations
    ? conversations[platform].length
    : 0;

  // Actualiza la función para manejar el cambio de calificación (solo actualiza el state local)
  const handleRatingChange = (conversationId: string, rating: number) => {
    // Actualizar el rating localmente
    setLocalRating(rating);

    // Actualizar la UI localmente (para reflejar inmediatamente el cambio)
    onRatingChange(conversationId, rating);

    // Actualizar la conversación seleccionada con el nuevo rating
    if (selectedConversation && selectedConversation.id === conversationId) {
      const updatedConversation = { ...selectedConversation, rating };
      setSelectedConversation(updatedConversation);
    }
  };

  // Actualiza la función para manejar el envío de feedback (ahora también incluye el rating)
  const handleFeedbackSubmit = async (conversationId: string) => {
    if (!agent.agentId) return;
    if (!feedback.trim() && !localRating) return;

    const messages = selectedConversation?.messages.flatMap((message) => [
      {
        sender: message.user_id,
        message: message.user_message,
      },
      {
        sender: agent.name,
        message: message.llm_response?.message,
        action: message.llm_response?.action,
        reasoning: message.llm_response?.reasoning,
      },
    ]);
    try {
      setIsSubmitting(true);

      const payload: any = {
        conversationId,
        messages,
      };

      // Incluir feedback solo si existe
      if (feedback.trim()) {
        payload.feedback = feedback.trim();
      }

      // Incluir rating solo si existe
      if (localRating) {
        payload.rating = localRating;
      }

      const response = await axios.post(
        `/api/agents/${agent.agentId}/conversations/feedback`,
        payload
      );

      if (response.status !== 200) {
        throw new Error("Error sending feedback");
      }

      // Actualizar la UI localmente
      if (feedback.trim()) {
        onFeedbackSubmit(conversationId, feedback);
      }

      // Actualizar la conversación seleccionada para mantener los valores
      if (selectedConversation) {
        const updatedConversation = { ...selectedConversation };

        // Actualizar el rating si existe
        if (localRating) {
          updatedConversation.rating = localRating;
        }

        // Actualizar el feedback si existe
        if (feedback.trim()) {
          updatedConversation.feedback = feedback.trim();
        }

        setSelectedConversation(updatedConversation);
      }

      toast({
        title: "Agent trained successfully!",
        description:
          "Your contributions will improve future responses of your assistant.",
        className:
          "bg-white border border-brand-border backdrop-blur-sm text-black",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast({
        title: "Error sending feedback",
        variant: "destructive",
        className:
          "bg-rose-500/80 border border-rose-500/30 backdrop-blur-sm text-white",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInteractionFeedback = async (
    interactionId: string,
    like: boolean,
    user?: string
  ) => {
    if (!agent.agentId) return;

    const message = selectedConversation?.messages.find(
      (message) => message.interaction_id === interactionId
    );
    if (!message) return;

    try {
      setIsSubmitting(true);

      const response = await axios.post(
        `/api/agents/${agent.agentId}/conversations/feedback`,
        {
          conversationId: selectedConversation?.id,
          interactionId,
          like,
          messages: [
            {
              sender: user ? user : message.user_id,
              message: message.user_message,
            },
            {
              sender: agent.name,
              message: message.llm_response?.message,
              action: message.llm_response?.action,
              reasoning: message.llm_response?.reasoning,
            },
          ],
        }
      );

      if (response.status !== 200) {
        throw new Error("Error sending feedback");
      }

      // Actualizar el estado localmente para reflejar el cambio en la UI
      // Creamos una copia profunda de la conversación seleccionada para no mutar el estado directamente
      if (selectedConversation) {
        const updatedConversation = { ...selectedConversation };
        const updatedMessages = [...updatedConversation.messages];

        // Encontrar el mensaje que estamos actualizando
        const messageIndex = updatedMessages.findIndex(
          (msg) => msg.interaction_id === interactionId
        );

        if (messageIndex !== -1) {
          // Actualizar el like en el mensaje
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            like: like,
          };

          // Actualizar los mensajes en la conversación
          updatedConversation.messages = updatedMessages;

          // Actualizar la conversación seleccionada
          setSelectedConversation(updatedConversation);
        }
      }

      toast({
        title: "Interaction evaluated successfully!",
        description:
          "Your feedback will help improve future responses of the agent in similar conversations.",
        className:
          "bg-white border border-brand-border backdrop-blur-sm text-black",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast({
        title: "Error sending feedback",
        variant: "destructive",
        className:
          "bg-rose-500/80 border border-rose-500/30 backdrop-blur-sm text-white",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
      refetchConversations();
    }
  };

  const handleDirectFeedback = async (interactionId: string) => {
    if (!agent.agentId || !directFeedbackText.trim()) return;

    const message = selectedConversation?.messages.find(
      (message) => message.interaction_id === interactionId
    );
    if (!message) return;

    try {
      setIsSubmitting(true);

      const response = await axios.post(
        `/api/agents/${agent.agentId}/conversations/feedback`,
        {
          conversationId: selectedConversation?.id,
          interactionId,
          directFeedback: directFeedbackText.trim(),
          messages: [
            {
              sender: message.user_id,
              message: message.user_message,
            },
            {
              sender: agent.name,
              message: message.llm_response?.message,
              action: message.llm_response?.action,
              reasoning: message.llm_response?.reasoning,
            },
          ],
        }
      );

      if (response.status !== 200) {
        throw new Error("Error sending feedback");
      }

      toast({
        title: "Feedback sent successfully!",
        description: "Your feedback will help improve future responses.",
        className: "bg-white border border-brand-border backdrop-blur-sm text-black",
        duration: 3000,
      });

      // Clear and close feedback
      setDirectFeedbackText("");
      setDirectFeedbackMessageId(null);
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast({
        title: "Error sending feedback",
        variant: "destructive",
        className: "bg-rose-500/80 border border-rose-500/30 backdrop-blur-sm text-white",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
      refetchConversations();
    }
  };

  const conversationsSearchTerm =
    conversations[platform].length > 0
      ? conversations[platform].filter((conversation) => {
          return conversation.messages.some((message) => {
            return (
              message.user_message
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              message.user_id.toLowerCase().includes(searchTerm.toLowerCase())
            );
          });
        })
      : [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="w-fit rounded-lg border border-green-300 bg-transparent px-3 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 flex items-center gap-1">
          <MessageSquare className="w-4 h-4 mr-2" />
          Review &amp; Help Train Your Agent ({conversationsCount})
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl h-[85vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>Conversation Review &amp; Agent Training</span>
            </span>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevPlatform}
                disabled={!onPlatformChange}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-300",
                  platform === "twitter" && "bg-blue-100",
                  platform === "farcaster" && "bg-purple-100",
                  platform === "telegram" && "bg-indigo-100"
                )}
              >
                {getPlatformIcon(platform)}{" "}
                <span className="text-sm font-medium">
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextPlatform}
                disabled={!onPlatformChange}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 h-full flex-1">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ul className="space-y-4 list-none overflow-y-auto max-h-[650px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg col-span-1">
              {hasConversations ? (
                conversationsSearchTerm.map((conversation) => {
                  let username;
                  let platformUrl;
                  switch (platform) {
                    case "farcaster":
                      if (conversation.messages[0].metadata_from_client) {
                        username = JSON.parse(
                          conversation.messages[0].metadata_from_client
                        ).farcaster.author.username;
                        platformUrl = `https://warpcast.com/${username}`;
                      } else {
                        username = conversation.userId;
                        platformUrl = `https://warpcast.com/~/profiles/${username}`;
                      }
                      break;
                    case "twitter":
                      username = conversation.userId;
                      platformUrl = `https://x.com/${username}`;
                      break;
                    case "telegram":
                      username = conversation.userId;
                      // Intentar extraer el nombre de usuario del mensaje si está disponible
                      if (conversation.messages[0]?.user_message) {
                        const extractedUsername = extractTelegramUsername(
                          conversation.messages[0].user_message
                        );
                        if (extractedUsername) {
                          username = extractedUsername;
                        }
                      }
                      platformUrl = `https://t.me/${username}`;
                      break;
                  }
                  return (
                    <li
                      key={conversation.id}
                      className={`p-4 rounded-lg border cursor-pointer ${
                        selectedConversation?.id === conversation.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => {
                        // Actualizar el estado con la conversación seleccionada
                        setSelectedConversation(conversation);

                        // Cargar feedback existente si existe
                        const existingFeedback = findExistingFeedback(
                          conversation.id
                        );
                        if (existingFeedback && existingFeedback.feedback) {
                          setFeedback(existingFeedback.feedback);
                        } else {
                          setFeedback("");
                        }

                        // Cargar rating existente si existe
                        if (existingFeedback && existingFeedback.rating) {
                          setLocalRating(existingFeedback.rating);
                        } else {
                          setLocalRating(null);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            Conversation with{" "}
                            <Link
                              href={platformUrl}
                              target="_blank"
                              className={cn(
                                "text-black",
                                platform === "twitter" &&
                                  "text-blue-700 hover:text-blue-500",
                                platform === "farcaster" &&
                                  "text-purple-700 hover:text-purple-500",
                                platform === "telegram" &&
                                  "text-indigo-700 hover:text-indigo-500"
                              )}
                            >
                              {platform === "twitter" && "@"}
                              {platform === "farcaster" && "@"}
                              {username}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-500">
                            {conversation.messages.length} messages
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {conversation.rating && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1">
                                {conversation.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* <div className="mt-2 flex flex-wrap gap-2">
                      {conversation.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            // onTagRemove(conversation.id, tag);
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div> */}
                    </li>
                  );
                })
              ) : (
                <li className="p-4 rounded-lg border text-center">
                  <p className="text-gray-500">
                    No conversations available for {platform}
                  </p>
                </li>
              )}
            </ul>

            {selectedConversation && (
              <div className="space-y-4 col-span-2">
                <div className="p-4 rounded-lg border border-gray-200 flex flex-col gap-2">
                  <h3 className="font-medium">
                    Conversation Analysis &amp; Learning
                  </h3>
                  <p className="text-xs text-gray-500">
                    Review these interactions to train your agent and improve
                    its future responses.
                  </p>
                  <ul className="space-y-4 list-none overflow-y-auto h-[410px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 border border-gray-200 rounded-lg p-2">
                    {selectedConversation.messages.map((message) => {
                      let messageAnalysis = null;
                      let urlMessage = null;
                      let avatarSender = null;
                      let user = null;
                      const hasLike = message.like !== undefined;
                      const hasDirectFeedback = message.directFeedback !== undefined;
                      if (platform === "twitter") {
                        const {
                          originalMessage,
                          conversationTopics,
                          participantSummaries,
                        } = parseMessage(message.user_message);
                        messageAnalysis = {
                          userMessage: originalMessage,
                          conversationTopics,
                          participantSummaries,
                        };
                        const metadata = message.metadata_from_client
                          ? JSON.parse(message.metadata_from_client)
                          : null;
                        const tweetId = metadata?.twitter?.tweetId;
                        const authorUsername =
                          metadata?.twitter?.authorUsername;
                        user = metadata?.twitter?.authorUsername;
                        if (tweetId && authorUsername) {
                          urlMessage = `https://x.com/${authorUsername}/status/${tweetId}`;
                        }
                      } else if (platform === "farcaster") {
                        const metadata = message.metadata_from_client
                          ? JSON.parse(message.metadata_from_client)
                          : null;
                        avatarSender = metadata?.farcaster?.author?.pfp_url;
                        const castHash = metadata?.farcaster?.cast?.hash;
                        user = metadata?.farcaster?.author?.username;

                        if (castHash) {
                          urlMessage = `https://warpcast.com/~/conversations/${castHash}`;
                        }
                      } else if (platform === "telegram") {
                        const {
                          userMessage: originalMessage,
                          conversationSummary,
                          newInsights,
                          discussionTopics,
                          conversationPhase,
                          conversationTone,
                          userStance,
                          potentialQuestions,
                          recommendedResponses,
                        } = parseConversationContext(message.user_message);
                        messageAnalysis = {
                          userMessage: originalMessage,
                          conversationSummary,
                          newInsights,
                          discussionTopics,
                          conversationPhase,
                          conversationTone,
                          userStance,
                          potentialQuestions,
                          recommendedResponses,
                        };


                        // Extraer el nombre de usuario del mensaje de Telegram
                        const extractedUsername = extractTelegramUsername(
                          message.user_message
                        );
                        if (extractedUsername) {
                          user = extractedUsername;
                        }
                      }

                      return (
                        <li key={message.interaction_id} className="space-y-2">
                          {/* Mensaje del usuario */}
                          {/* User message */}
                          <div className="flex items-start gap-2">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                              {avatarSender ? (
                                <Image
                                  src={avatarSender}
                                  alt="Avatar"
                                  width={32}
                                  height={32}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-4 w-4 text-gray-600" />
                              )}
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                              {messageAnalysis ? (
                                <p className="text-sm">
                                  {messageAnalysis.userMessage}
                                </p>
                              ) : (
                                <p className="text-sm">
                                  {message.user_message}
                                </p>
                              )}
                              {messageAnalysis && (
                                <div className="space-y-2">
                                  {platform === "twitter" && (
                                    <div className="my-1 p-2 bg-blue-50 rounded text-xs text-gray-600">
                                      {messageAnalysis?.conversationTopics && (
                                        <>
                                          <p className="font-medium">Topics</p>
                                          <div className="mt-1">
                                            <p>
                                              {messageAnalysis.conversationTopics.join(
                                                ", "
                                              )}
                                            </p>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                  <div className="my-1 p-2 bg-blue-50 rounded text-xs text-gray-600">
                                    {messageAnalysis?.participantSummaries && (
                                      <>
                                        <p className="font-medium">
                                          Participant Summaries
                                        </p>
                                        <div className="mt-1">
                                          {Object.entries(
                                            messageAnalysis.participantSummaries
                                          ).map(([username, summary]) => (
                                            <p key={username}>
                                              {username}: {summary}
                                            </p>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                    {messageAnalysis?.conversationSummary && (
                                      <>
                                        <p className="font-medium">
                                          Conversation Summary
                                        </p>
                                        <div className="mt-1">
                                          <p>
                                            {
                                              messageAnalysis.conversationSummary
                                            }
                                          </p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-2">
                                {urlMessage && (
                                  <div className="mt-2 flex items-center gap-1">
                                    <Link
                                      href={urlMessage}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 underline "
                                    >
                                      {platform === "twitter"
                                        ? "Tweet"
                                        : platform === "farcaster"
                                        ? "Cast"
                                        : "Message URL"}
                                      <ExternalLink className="w-4 h-4" />
                                    </Link>
                                  </div>
                                )}
                                <span className="text-xs text-gray-500 ml-auto">
                                  {new Date(
                                    message.started_at.value
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Mensaje del bot */}
                          {/* Bot message */}
                          <div className="flex items-start gap-2 justify-end">
                            <div className="flex flex-col items-center gap-2 mr-1 my-auto">
                              <Button
                                variant={
                                  hasLike && message.like === true
                                    ? "default"
                                    : "ghost"
                                }
                                size="icon"
                                className={`h-8 w-8 rounded-full disabled:opacity-50 
                                  ${
                                    hasLike && message.like === true
                                      ? "bg-lime-500 hover:bg-lime-600"
                                      : "hover:bg-lime-100"
                                  }`}
                                title="Like - Reinforce this type of response"
                                disabled={isSubmitting}
                                onClick={() => {
                                  handleInteractionFeedback(
                                    message.interaction_id,
                                    true,
                                    user
                                  );
                                }}
                              >
                                {isSubmitting ? (
                                  <Loader2 className="h-4 w-4 text-lime-600 animate-spin" />
                                ) : (
                                  <ThumbsUp
                                    className={`h-4 w-4 ${
                                      hasLike && message.like === true
                                        ? "text-white"
                                        : "text-lime-600"
                                    }`}
                                  />
                                )}
                              </Button>
                              <Button
                                variant={
                                  hasLike && message.like === false
                                    ? "default"
                                    : "ghost"
                                }
                                size="icon"
                                className={`h-8 w-8 rounded-full disabled:opacity-50 
                                  ${
                                    hasLike && message.like === false
                                      ? "bg-rose-500 hover:bg-rose-600"
                                      : "hover:bg-rose-100"
                                  }`}
                                title="Dislike - Avoid this type of response"
                                disabled={isSubmitting}
                                onClick={() => {
                                  handleInteractionFeedback(
                                    message.interaction_id,
                                    false,
                                    user
                                  );
                                }}
                              >
                                {isSubmitting ? (
                                  <Loader2 className="h-4 w-4 text-rose-600 animate-spin" />
                                ) : (
                                  <ThumbsDown
                                    className={`h-4 w-4 ${
                                      hasLike && message.like === false
                                        ? "text-white"
                                        : "text-rose-600"
                                    }`}
                                  />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-blue-100"
                                title="Add direct feedback"
                                disabled={isSubmitting}
                                onClick={() => setDirectFeedbackMessageId(message.interaction_id)}
                              >
                                <MessageCircle className="h-4 w-4 text-blue-600" />
                              </Button>
                            </div>
                            <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                              <p className="text-sm">
                                {message.llm_response?.message}
                              </p>
                              {message.llm_response?.reasoning && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-600">
                                  <div className="mt-1">
                                    <p className="font-medium">Reasoning:</p>
                                    <p>{message.llm_response?.reasoning}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-200 overflow-hidden">
                              {(() => {
                                switch (platform) {
                                  case "twitter":
                                    if (agent.twitterClient?.profileImageUrl) {
                                      return (
                                        <Image
                                          src={
                                            agent.twitterClient.profileImageUrl
                                          }
                                          alt="Avatar"
                                          width={32}
                                          height={32}
                                          className="rounded-full object-cover"
                                        />
                                      );
                                    } else {
                                      return (
                                        <FaXTwitter className="h-4 w-4 text-blue-600" />
                                      );
                                    }
                                  case "farcaster":
                                    if (agent.farcasterClient?.pfp_url) {
                                      return (
                                        <Image
                                          src={agent.farcasterClient.pfp_url}
                                          alt="Avatar"
                                          width={32}
                                          height={32}
                                          className="rounded-full object-cover"
                                        />
                                      );
                                    } else {
                                      return <FarcasterIcon color="blue" />;
                                    }
                                  case "telegram":
                                    return (
                                      <FaTelegram className="h-4 w-4 text-blue-600" />
                                    );
                                  default:
                                    return (
                                      <Bot className="h-4 w-4 text-blue-600" />
                                    );
                                }
                              })()}
                            </div>
                          </div>
                          {directFeedbackMessageId === message.interaction_id && !hasDirectFeedback && (
                            <div className="flex items-center gap-2 justify-end mt-2">
                              <Input
                                placeholder="Write feedback..."
                                value={directFeedbackText}
                                onChange={(e) => setDirectFeedbackText(e.target.value)}
                                className="h-8 w-64 text-xs"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-green-100"
                                onClick={() => handleDirectFeedback(message.interaction_id)}
                                disabled={!directFeedbackText.trim() || isSubmitting}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-rose-100"
                                onClick={() => {
                                  setDirectFeedbackText("");
                                  setDirectFeedbackMessageId(null);
                                }}
                              >
                                <X className="h-4 w-4 text-rose-600" />
                              </Button>
                            </div>
                          )}
                          {hasDirectFeedback && (
                            <div className="flex flex-col gap-2 justify-end text-right mt-2 bg-green-50 p-2 rounded-lg w-max ml-auto">
                              <h6 className="text-xs font-medium">Feedback</h6>
                              <p className="text-sm">{message.directFeedback}</p>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="space-y-4">
                    {/* <div className="flex items-center gap-2">
                      <Input
                        placeholder="New tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleTagAdd(selectedConversation.id)}
                        variant="outline"
                      >
                        <Tag className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div> */}

                    <div className="flex items-center gap-2"></div>

                    <div>
                      <Textarea
                        placeholder="Write your feedback..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="min-h-[50px]"
                      />

                      <p className="text-xs text-gray-500 mt-1 italic">
                        Your feedback helps improve the personality of the agent
                        and enrich its knowledge tree for future interactions.
                      </p>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Rating</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Star
                                key={rating}
                                className={`w-5 h-5 cursor-pointer ${
                                  (localRating !== null
                                    ? localRating
                                    : selectedConversation?.rating) &&
                                  rating <=
                                    (localRating !== null
                                      ? localRating
                                      : selectedConversation?.rating || 0)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                                onClick={() => {
                                  if (selectedConversation) {
                                    handleRatingChange(
                                      selectedConversation.id,
                                      rating
                                    );
                                  }
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <Button
                          className={cn(
                            "mt-2 ml-auto text-white",
                            platform === "twitter" && "bg-blue-500",
                            platform === "farcaster" && "bg-purple-500",
                            platform === "telegram" && "bg-indigo-500"
                          )}
                          onClick={() => {
                            handleFeedbackSubmit(selectedConversation.id);
                          }}
                          disabled={
                            isSubmitting ||
                            (!feedback.trim() && localRating === null)
                          }
                        >
                          {isSubmitting ? "Submitting..." : "Train Agent"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
