// react
import { useEffect, useState } from "react";

// axios
import axios from "axios";

// types
import {
  TwitterAutomation,
  ScheduleAutomation,
  MentionAutomation,
  TargetAutomation,
} from "@/types/agent.model";

// components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";

// icons
import {
  Calendar,
  Clock,
  RefreshCw,
  Send,
  AtSign,
  Hash,
  MessageCircle,
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { FaFire } from "react-icons/fa";

// utils
import { useToast } from "../shadcn/use-toast";
import { firestoreTimestampToDate } from "@/utils/firestore-timestamp";

// Define the platform type
export type SocialPlatform = "twitter" | "farcaster" | "other";
export type TaskType = "schedule" | "mention" | "target";

// Interface for the component props
interface SocialMediaScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  platform: SocialPlatform;
  refetchAgent: () => void;
  onSuccess?: () => void; // Optional callback for when scheduling is successful
  isEditing?: string | null;
  scheduleObject?: TwitterAutomation;
  taskType?: TaskType;
  currentPost?: ScheduleAutomation | MentionAutomation | TargetAutomation;
}

// Platform-specific configurations
const platformConfig = {
  twitter: {
    title: "Schedule Post on Twitter",
    description: "Configure when and what your agent should post on Twitter",
    apiEndpoint: "/api/scheduled-posts",
    buttonText: "Schedule Tweet",
    icon: <FaXTwitter className="h-4 w-4" />,
    fieldLabel: "Tweet content",
    fieldPlaceholder: "What do you want to tweet?",
    characterLimit: 280,
  },
  farcaster: {
    title: "Schedule Cast on Farcaster",
    description: "Configure when and what your agent should post on Farcaster",
    apiEndpoint: "/api/scheduled-posts",
    buttonText: "Schedule Cast",
    icon: <FaFire className="h-4 w-4" />,
    fieldLabel: "Instruction for the agent",
    fieldPlaceholder:
      "E.g.: Share an update about the crypto market focusing on Bitcoin and Ethereum",
    characterLimit: 320,
  },
  other: {
    title: "Schedule Social Media Post",
    description: "Configure when and what your agent should post",
    apiEndpoint: "/api/scheduled-posts",
    buttonText: "Schedule Post",
    icon: <Send className="h-4 w-4" />,
    fieldLabel: "Post content",
    fieldPlaceholder: "What do you want to post?",
    characterLimit: 500,
  },
};

// Task-specific configurations
const taskTypeConfig = {
  schedule: {
    title: "Schedule Post",
    description: "Configure when and what your agent should post",
    icon: <Send className="h-4 w-4" />,
    fieldLabel: "Post content",
    fieldPlaceholder: "What do you want to post?",
    instructionLabel: "Post content",
    instructionPlaceholder: "What do you want to post?",
  },
  mention: {
    title: "Respond to Keywords",
    description:
      "Configure keywords for your agent to automatically respond to",
    icon: <Hash className="h-4 w-4" />,
    fieldLabel: "Keywords (separated by commas)",
    fieldPlaceholder: "crypto, bitcoin, ethereum, blockchain",
    instructionLabel: "Response instructions",
    instructionPlaceholder:
      "Explain how your agent should respond to tweets containing these keywords",
  },
  target: {
    title: "Respond to Accounts",
    description:
      "Configure target accounts for your agent to automatically respond to",
    icon: <AtSign className="h-4 w-4" />,
    fieldLabel: "Target accounts (separated by commas)",
    fieldPlaceholder: "@user1, @user2, @user3",
    instructionLabel: "Response instructions",
    instructionPlaceholder:
      "Explain how your agent should respond to tweets from these accounts",
  },
};

export function SocialMediaScheduleModal({
  isOpen,
  onClose,
  agentId,
  platform,
  refetchAgent,
  onSuccess,
  isEditing,
  scheduleObject,
  taskType = "schedule",
  currentPost,
}: SocialMediaScheduleModalProps) {
  const [content, setContent] = useState("");
  const [instruction, setInstruction] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [recurringPattern, setRecurringPattern] = useState<string>("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (currentPost) {
      // Para menciones y objetivos, establecer el contenido según el tipo
      console.log(currentPost);
      if (
        taskType === "mention" &&
        (currentPost as MentionAutomation).mention &&
        (currentPost as MentionAutomation).mention.topics &&
        (currentPost as MentionAutomation).mention.promptTemplate
      ) {
        setContent(
          (currentPost as MentionAutomation).mention.topics.join(", ")
        );
        setInstruction(
          (currentPost as MentionAutomation).mention.promptTemplate || ""
        );
      } else if (
        taskType === "target" &&
        (currentPost as TargetAutomation).target &&
        (currentPost as TargetAutomation).target.users &&
        (currentPost as TargetAutomation).target.promptTemplate
      ) {
        setContent((currentPost as TargetAutomation).target.users.join(", "));
        setInstruction(
          (currentPost as TargetAutomation).target.promptTemplate || ""
        );
      }

      if (
        taskType === "schedule" &&
        (currentPost as ScheduleAutomation).schedule?.nextRun
      ) {
        setInstruction(
          (currentPost as ScheduleAutomation).schedule.promptTemplate
        );

        const nextRun = (currentPost as ScheduleAutomation).schedule.nextRun;
        const date = firestoreTimestampToDate(nextRun);

        // Formatear la fecha como "YYYY-MM-DD"
        setScheduleDate(date.toISOString().split("T")[0]);

        // Formatear la hora como "HH:MM"
        setScheduleTime(date.toISOString().split("T")[1].substring(0, 5));

        // Establecer el patrón recurrente
        if ((currentPost as ScheduleAutomation).schedule.recurringPattern) {
          setRecurringPattern(
            (currentPost as ScheduleAutomation).schedule.recurringPattern
          );
        }
      }
    } else if (!isEditing && !currentPost) {
      setContent("");
      setInstruction("");
      setScheduleDate("");
      setScheduleTime("");
      setRecurringPattern("none");
    }
  }, [currentPost, taskType, isEditing]);

  // Get the configuration for the current platform
  const config = platformConfig[platform] || platformConfig.other;
  // Get the configuration for the current task type
  const taskConfig = taskTypeConfig[taskType];

  const handleSubmit = async () => {
    if (!instruction.trim()) {
      setSubmitResult({
        success: false,
        message: "Instructions are required",
      });
      return;
    }

    if (taskType === "schedule" && (!scheduleDate || !scheduleTime)) {
      setSubmitResult({
        success: false,
        message: "Date and time are required",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitResult(null);

      // Prepare payload based on platform and task type
      const payload: any = {
        agentId,
        instruction: instruction,
        platform,
        taskType,
      };

      // Add ID if we're editing an existing post
      if (currentPost && currentPost.id) {
        payload.id = currentPost.id;
      }

      // Add schedule-specific fields only for scheduled posts
      switch (taskType) {
        case "schedule":
          const localDate = new Date(
            `${scheduleDate}T${scheduleTime || "00:00"}:00`
          );

          const scheduleTimeISO = localDate.toISOString();
          payload.scheduleTime = scheduleTimeISO;
          payload.recurringPattern = recurringPattern;
          break;
        case "mention":
          const mentionTopics = content
            .split(",")
            .map((topic: string) => topic.trim());
          payload.mentionTopics = mentionTopics;
          break;
        case "target":
          const targetProfiles = content
            .split(",")
            .map((profile: string) => profile.trim().replace("@", ""));
          payload.targetProfiles = targetProfiles;
          break;
      }

      let response;
      if (isEditing) {
        response = await axios.put(`${config.apiEndpoint}`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        response = await axios.post(config.apiEndpoint, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      console.log(response);
      const postType =
        platform === "twitter"
          ? "tweet"
          : platform === "farcaster"
          ? "cast"
          : "post";

      const actionType =
        taskType === "schedule"
          ? "scheduled"
          : taskType === "mention"
          ? "configured to respond to keywords"
          : "configured to respond to accounts";

      if (response.status === 200) {
        toast({
          title: `${postType} ${actionType} successfully`,
          description: `Your ${postType} has been ${actionType} successfully`,
        });
        refetchAgent();
      }

      setSubmitResult({
        success: true,
        message: `${postType} ${actionType} successfully`,
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        setContent("");
        setInstruction("");
        setScheduleDate("");
        setScheduleTime("");
        setRecurringPattern("none");
        setSubmitResult(null);

        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }

        onClose();
      }, 2000);
    } catch (error) {
      console.error(`Error configuring ${platform} ${taskType}:`, error);
      setSubmitResult({
        success: false,
        message: `Error configuring ${platform} ${taskType}. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ringClassName =
    platform === "twitter" ? "focus:ring-blue-500" : "focus:ring-purple-500";
  const buttonClassName =
    platform === "twitter"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-purple-600 hover:bg-purple-700";
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{taskConfig.title}</DialogTitle>
          <DialogDescription>{taskConfig.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          {taskType !== "schedule" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {taskConfig.fieldLabel}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={taskConfig.fieldPlaceholder}
                className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 ${ringClassName} focus:border-transparent transition-all h-24`}
                maxLength={config.characterLimit}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <MessageCircle className="h-4 w-4 text-blue-500" />{" "}
              {taskConfig.instructionLabel}
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder={taskConfig.instructionPlaceholder}
              className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 ${ringClassName} focus:border-transparent transition-all h-24`}
            />
            {taskType === "schedule" && (
              <p className="text-xs text-gray-500 flex justify-end">
                {content.length}/{config.characterLimit} characters
              </p>
            )}
          </div>

          {taskType === "schedule" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 ${ringClassName} focus:border-transparent transition-all`}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 ${ringClassName} focus:border-transparent transition-all`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" /> Recurring pattern
                </label>
                <select
                  value={recurringPattern}
                  onChange={(e) => setRecurringPattern(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 ${ringClassName} focus:border-transparent transition-all`}
                >
                  <option value="none">No repetition</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </>
          )}

          {taskType === "mention" && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Your agent will automatically respond to tweets containing these
                keywords from the last hour.
              </p>
            </div>
          )}

          {taskType === "target" && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Your agent will automatically respond to tweets from these
                accounts from the last hour.
              </p>
            </div>
          )}

          {submitResult && (
            <div
              className={`p-3 rounded-md ${
                submitResult.success
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {submitResult.message}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={buttonClassName}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 text-white">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Configuring...
              </span>
            ) : (
              <span className="flex items-center gap-2 text-white">
                {taskConfig.icon}
                {taskType === "schedule"
                  ? config.buttonText
                  : taskType === "mention"
                  ? "Configure Keywords"
                  : "Configure Accounts"}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SocialMediaScheduleModal;
