// react
import { useState } from "react";

// types
import {
  Agent,
  TwitterAutomation,
  ScheduleAutomation,
  MentionAutomation,
  TargetAutomation,
} from "@/types/agent.model";

// utils
import { format } from "date-fns";
import { es } from "date-fns/locale";

// icons
import {
  AlertCircle,
  Calendar,
  Clock,
  RefreshCw,
  Trash2,
  AtSign,
  Hash,
  MessageSquare,
  MessageCircle,
  Pencil,
} from "lucide-react";

// components
import { Button } from "@/components/shadcn/button";
import { useToast } from "@/components/shadcn/use-toast";
import SocialMediaScheduleModal from "./SocialMediaScheduleModal";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";

interface TwitterScheduledPostsProps {
  agent: Agent;
  refetchAgent: () => void;
}

export function TwitterScheduledPosts({
  agent,
  refetchAgent,
}: TwitterScheduledPostsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("schedule");
  const [currentTaskType, setCurrentTaskType] = useState<
    "schedule" | "mention" | "target"
  >("schedule");
  const [currentPost, setCurrentPost] = useState<
    ScheduleAutomation | MentionAutomation | TargetAutomation | null
  >(null);

  const { toast } = useToast();

  // Función para convertir segundos a Date
  const convertFirestoreTimestamp = (timestamp: {
    _seconds: number;
    _nanoseconds: number;
  }) => {
    return new Date(timestamp._seconds * 1000);
  };

  // Function to format the date
  const formatDate = (timestamp: {
    _seconds: number;
    _nanoseconds: number;
  }) => {
    const date = convertFirestoreTimestamp(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Function to get the recurring pattern text
  const getRecurringPatternText = (pattern?: string) => {
    if (!pattern) return "Once";

    const patterns: Record<string, string> = {
      hourly: "Hourly",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly",
    };

    return patterns[pattern] || "Once";
  };

  const deleteAutomation = async (postId: string, taskType: string) => {
    setIsDeleting(postId);
    try {
      const response = await fetch(
        `/api/scheduled-posts?postId=${postId}&platform=twitter&taskType=${taskType}`,
        {
          method: "DELETE",
        }
      );

      if (response.status !== 200) {
        throw new Error(`Could not delete the ${taskType} automation`);
      }

      // Update the agent's scheduledTweets array
      if (agent.scheduledTweets) {
        agent.scheduledTweets = agent.scheduledTweets.filter(
          (post) => post.id !== postId
        );
      }

      toast({
        title: "Automation deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error(`Error deleting ${taskType} automation:`, error);
      toast({
        title: `Could not delete the ${taskType} automation`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPpp", { locale: es });
  };

  const formatCreatedAt = (timestamp?: {
    _seconds: number;
    _nanoseconds: number;
  }) => {
    if (!timestamp) return "N/A";
    const date = convertFirestoreTimestamp(timestamp);
    return format(date, "PPpp", { locale: es });
  };

  const handleOpenModal = (taskType: "schedule" | "mention" | "target") => {
    setCurrentTaskType(taskType);
    setIsModalOpen(true);
    setCurrentPost(null);
    setIsEditing(null);
  };

  const handleEditPost = (
    taskType: "schedule" | "mention" | "target",
    post: ScheduleAutomation | MentionAutomation | TargetAutomation
  ) => {
    setCurrentTaskType(taskType);
    setCurrentPost(post);
    setIsEditing(post.id);
    setIsModalOpen(true);
  };

  // Componente para mostrar los tweets programados
  const ScheduledTweetsTab = () => (
    <div className="space-y-4">
      {!agent?.scheduledTweets ||
      agent.scheduledTweets.filter((post) => post.type === "schedule")
        .length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-center">
          <p className="text-base text-blue-700">
            You don&apos;t have any scheduled posts. Schedule your first post!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {agent.scheduledTweets
            .filter(
              (post): post is ScheduleAutomation => post.type === "schedule"
            )
            .map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-800 mb-3 line-clamp-2">
                      {post.schedule.promptTemplate}
                    </p>

                    {post.instruction && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Instructions:
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                          {post.instruction}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>Next: {formatDate(post.schedule.nextRun)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                        <span>
                          {getRecurringPatternText(
                            post.schedule.recurringPattern
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 p-2 h-auto"
                    onClick={() => handleEditPost("schedule", post)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 p-2 h-auto"
                    onClick={() => deleteAutomation(post.id, "schedule")}
                    disabled={isDeleting === post.id}
                  >
                    {isDeleting === post.id ? (
                      <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  // Componente para mostrar las respuestas a palabras clave
  const KeywordsResponsesTab = () => (
    <div className="space-y-4">
      {!agent?.scheduledTweets ||
      agent.scheduledTweets.filter((post) => post.type === "mention").length ===
        0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-center">
          <p className="text-base text-blue-700">
            You don&apos;t have any keyword responses configured. Configure your
            first response!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {agent.scheduledTweets
            .filter(
              (post): post is MentionAutomation => post.type === "mention"
            )
            .map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="h-5 w-5 text-blue-500" />
                      <h4 className="text-lg font-medium text-gray-800">
                        Keywords
                      </h4>
                    </div>

                    <p className="text-base text-gray-700 mb-3 bg-blue-50 p-2 rounded-md">
                      {post.mention.topics.join(", ")}
                    </p>

                    {post.mention.promptTemplate && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Instructions:
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                          {post.mention.promptTemplate}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-gray-600">
                      {post.createdAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>
                            Created: {formatCreatedAt(post.createdAt)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>Responds to tweets from the last hour</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 p-2 h-auto"
                    onClick={() => handleEditPost("mention", post)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 p-2 h-auto"
                    onClick={() => deleteAutomation(post.id, "mention")}
                    disabled={isDeleting === post.id}
                  >
                    {isDeleting === post.id ? (
                      <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  // Componente para mostrar las respuestas a cuentas objetivo
  const AccountsResponsesTab = () => (
    <div className="space-y-4">
      {!agent?.scheduledTweets ||
      agent.scheduledTweets.filter((post) => post.type === "target").length ===
        0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-center">
          <p className="text-base text-blue-700">
            You don&apos;t have any target account responses configured.
            Configure your first response!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {agent.scheduledTweets
            .filter((post): post is TargetAutomation => post.type === "target")
            .map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AtSign className="h-5 w-5 text-blue-500" />
                      <h4 className="text-lg font-medium text-gray-800">
                        Target Accounts
                      </h4>
                    </div>

                    <p className="text-base text-gray-700 mb-3 bg-blue-50 p-2 rounded-md">
                      {post.target.users.join(", ")}
                    </p>

                    {post.target.promptTemplate && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Instructions:
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                          {post.target.promptTemplate}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-gray-600">
                      {post.createdAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>
                            Created: {formatCreatedAt(post.createdAt)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>Responds to tweets from the last hour</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 p-2 h-auto"
                    onClick={() => handleEditPost("target", post)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 p-2 h-auto"
                    onClick={() => deleteAutomation(post.id, "target")}
                    disabled={isDeleting === post.id}
                  >
                    {isDeleting === post.id ? (
                      <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-800">
            Twitter Automation
          </h3>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-base text-red-700">{error}</p>
        </div>
      ) : (
        <Tabs
          defaultValue="schedule"
          className="w-full"
          onValueChange={(value) =>
            setActiveTab(value as "schedule" | "mention" | "target")
          }
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Posts</span>
              </TabsTrigger>
              <TabsTrigger value="mention" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                <span>Keywords</span>
              </TabsTrigger>
              <TabsTrigger value="target" className="flex items-center gap-2">
                <AtSign className="h-4 w-4" />
                <span>Accounts</span>
              </TabsTrigger>
            </TabsList>

            <Button
              onClick={() =>
                handleOpenModal(activeTab as "schedule" | "mention" | "target")
              }
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 h-auto"
            >
              {activeTab === "schedule"
                ? "Schedule New"
                : activeTab === "mention"
                ? "Add Keywords"
                : "Add Accounts"}
            </Button>
          </div>

          <TabsContent value="schedule">
            <ScheduledTweetsTab />
          </TabsContent>

          <TabsContent value="mention">
            <KeywordsResponsesTab />
          </TabsContent>

          <TabsContent value="target">
            <AccountsResponsesTab />
          </TabsContent>
        </Tabs>
      )}

      {agent.agentId && (
        <SocialMediaScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          agentId={agent.agentId}
          platform="twitter"
          refetchAgent={refetchAgent}
          isEditing={isEditing}
          taskType={currentTaskType}
          currentPost={
            currentPost as
              | ScheduleAutomation
              | MentionAutomation
              | TargetAutomation
              | undefined
          }
        />
      )}
    </div>
  );
}
