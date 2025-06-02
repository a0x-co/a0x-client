/* eslint-disable @typescript-eslint/no-explicit-any */
// react
import React, { useState } from "react";

// components
import { ChatMessage } from "@/components/Chat/ChatMessage";
import { AgentPersonality } from "@/components/AgentDetails/AgentPersonality";

// types
import {
  AgentPersonalityElizaFormat,
  Agent,
  AgentType,
  PersonalityBuildActionTrigger,
  AgentPersonalityConfig,
} from "@/types";

interface ChatMessageType {
  role: "user" | AgentType;
  content: string;
  action?: PersonalityBuildActionTrigger;
  personality?: AgentPersonalityElizaFormat;
  isVisible?: boolean;
  isThinking?: boolean;
}

interface PersonalityBuildProps {
  chatMessages: ChatMessageType[];
  agent: Agent;
  config: AgentPersonalityConfig;
  setConfig: (config: AgentPersonalityConfig) => void;
  originalPersonality: AgentPersonalityConfig;
  setOriginalPersonality: (personality: AgentPersonalityConfig) => void;
}

export function PersonalityBuild({
  chatMessages,
  agent,
  config,
  setConfig,
  originalPersonality,
  setOriginalPersonality,
}: PersonalityBuildProps) {
  return (
    <>
      {chatMessages.map((chat, index) => {
        return (
          <div key={index} className="flex flex-col gap-4">
            <ChatMessage
              role={chat.role}
              content={chat.content}
              isVisible={chat.isVisible}
              isThinking={chat.isThinking}
              agentToTalkWith={{
                agent: chat.role as AgentType,
              }}
            />
            {chat.action ===
              PersonalityBuildActionTrigger.GET_CURRENT_PERSONALITY &&
              chat.personality &&
              config && (
                <AgentPersonality
                  agent={agent}
                  from="dashboard"
                  config={config}
                  setConfig={setConfig}
                  originalPersonality={originalPersonality}
                  setOriginalPersonality={setOriginalPersonality}
                />
              )}
          </div>
        );
      })}
    </>
  );
}
