// icons
import { Bot, Brain, User, BadgeDollarSign, Plug } from "lucide-react";

// types
import { AgentType } from "@/types";
import Image from "next/image";
interface ChatMessageProps {
  role: "user" | AgentType;
  content: string;
  isVisible?: boolean;
  isThinking?: boolean;
  agentToTalkWith: {
    agent: AgentType;
  };
  imageInvited?: string | null;
  imageAgentFarcaster?: string;
}

const renderAgentIcon = (
  agent: AgentType,
  agentStyles: { borderColor: string; textColor: string }
) => {
  switch (agent) {
    case "wealth-manager":
      return (
        <div
          className={`relative w-full h-full rounded-lg bg-black/20 border ${agentStyles.borderColor} flex items-center justify-center backdrop-blur-sm`}
        >
          <BadgeDollarSign className={`w-4 h-4 ${agentStyles.textColor}`} />
        </div>
      );
    case "psicologist":
      return (
        <div
          className={`relative w-full h-full rounded-lg bg-black/20 border ${agentStyles.borderColor} flex items-center justify-center backdrop-blur-sm`}
        >
          <Bot className={`w-4 h-4 ${agentStyles.textColor}`} />
        </div>
      );
    default:
      return (
        <div
          className={`relative w-full h-full rounded-lg bg-black/20 border ${agentStyles.borderColor} flex items-center justify-center backdrop-blur-sm`}
        >
          <Brain className={`w-4 h-4 ${agentStyles.textColor}`} />
        </div>
      );
  }
};

export function ChatMessage({
  role,
  content,
  isVisible,
  isThinking,
  agentToTalkWith,
  imageInvited,
  imageAgentFarcaster,
}: ChatMessageProps) {
  const getAgentStyles = () => {
    switch (agentToTalkWith.agent) {
      case "wealth-manager":
        return {
          borderColor: "border-yellow-500",
          textColor: "text-yellow-500",
        };
      case "psicologist":
        return {
          borderColor: "border-green-500",
          textColor: "text-green-500",
        };
      case "userAgent":
        return {
          borderColor: "border-cyan-500",
          textColor: "text-cyan-500",
        };
      default:
        return {
          borderColor: "border-cyan-500",
          textColor: "text-cyan-500",
        };
    }
  };

  const agentStyles = getAgentStyles();

  return (
    <li
      className={`flex items-start space-x-4 ${
        role === "user" ? "flex-row-reverse space-x-reverse" : ""
      } transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      } max-w-4xl ${role === "user" ? "ml-auto" : "mr-auto"}`}
    >
      {role === "userAgent" && imageAgentFarcaster && (
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image
            src={imageAgentFarcaster}
            alt="Agent"
            className="w-full h-full object-cover rounded-full border border-cyan-500"
            width={48}
            height={48}
          />
          <Bot className="w-4 h-4 text-white absolute bottom-0 -right-2 rounded-full" />
        </div>
      )}
      {role === "user" && imageInvited && (
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image
            src={imageInvited}
            alt="Invited"
            className="w-full h-full object-cover rounded-full border border-white"
            width={48}
            height={48}
          />
        </div>
      )}

      {!imageInvited &&
      !imageAgentFarcaster &&
      (role === "userAgent" ||
        role === "psicologist" ||
        role === "wealth-manager") ? (
        <div className="relative w-8 h-8 flex-shrink-0">
          {renderAgentIcon(agentToTalkWith.agent, agentStyles)}
        </div>
      ) : (
        !imageInvited &&
        !imageAgentFarcaster && (
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="relative w-full h-full rounded-lg bg-black/20 border border-white flex items-center justify-center backdrop-blur-sm">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        )
      )}

      <div className={`flex-1 ${role === "user" ? "mr-4" : "ml-4"}`}>
        <div
          className={`px-4 py-3 rounded-lg backdrop-blur-sm ${
            role === "userAgent" ||
            role === "psicologist" ||
            role === "wealth-manager"
              ? `bg-black/20 border ${agentStyles.borderColor}`
              : "bg-black/20 border border-white"
          }`}
        >
          <p className="text-sm">
            <span
              className={
                role === "userAgent" ||
                role === "psicologist" ||
                role === "wealth-manager"
                  ? agentStyles.textColor
                  : "text-white"
              }
            >
              {role === "userAgent" ? ">" : ">"} {content}
              {isThinking && (
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
            </span>
            <span className="animate-pulse">_</span>
          </p>
        </div>
      </div>
    </li>
  );
}
