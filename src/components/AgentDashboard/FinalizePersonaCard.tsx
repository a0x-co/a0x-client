// react
import React, { useState } from "react";

// axios
import axios from "axios";

// lucide
import { Bot } from "lucide-react";

// types
import { AgentPersonalityConfig, PersonalityBuildActionTrigger } from "@/types";

// utils
import { cn } from "@/lib/utils";

export const FinalizePersonaCard = ({
  userAddress,
  agentName,
  onFinalize,
  onDesactivate,
  isFinalizeActive,
  isFinalizeSuccess,
  config,
  agentEndpoint,
  setFinalizedSuccess,
  action,
}: {
  userAddress: string;
  agentName: string;
  onFinalize: () => void;
  onDesactivate: () => void;
  isFinalizeActive: boolean;
  isFinalizeSuccess: boolean;
  config: AgentPersonalityConfig;
  agentEndpoint: string;
  setFinalizedSuccess: (success: boolean) => void;
  action?: PersonalityBuildActionTrigger;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFinalize = async () => {
    setIsLoading(true);
    onFinalize();
    try {
      const response = await axios.post("/api/finalize-build-personality", {
        userAddress: userAddress.toLowerCase(),
        agentName,
        personalityJson: config,
      });
      if (response.status === 200) {
        setFinalizedSuccess(true);
        const reloadResponse = await axios.post("/api/reload-agent", {
          characterName: agentName,
          endpoint: agentEndpoint,
        });
      }
    } catch (error) {
      console.error("Error finalizing personality:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        onDesactivate();
        setFinalizedSuccess(false);
      }, 10000);
    }
  };

  if (isFinalizeSuccess) {
    return (
      <div className="absolute -top-28 left-0 w-full p-4 rounded-lg bg-gradient-to-r from-green-500/90 to-green-500/90 border border-green-500 opacity-100 hover:shadow-[0_0_0_1px_rgba(59,230,106,0.1)] shadow-[0_8px_20px_rgba(59,230,106,0.1)]">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-green-100" />
          <span className="text-green-100 font-medium">
            Personality updated successfully.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute -top-[150px] left-0 w-full transition-opacity duration-300",
        isFinalizeActive
          ? "opacity-100 z-10"
          : isHovered
          ? "opacity-100 z-10"
          : "opacity-0 hover:opacity-50 hover:z-10"
      )}
    >
      <div className="p-4 w-full rounded-lg bg-gradient-to-r from-green-700/90 to-green-700/90 border border-green-600 opacity-100">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-green-100" />
            <span className="text-green-100 font-medium">
              {action === PersonalityBuildActionTrigger.GET_CURRENT_PERSONALITY
                ? "Save Personality"
                : "Finalize Conversational & Save Personality"}
            </span>
          </div>

          <button
            onClick={handleFinalize}
            disabled={isLoading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-white rounded-lg border border-green-500/30 transition-all duration-300 backdrop-blur-sm button-finalize"
          >
            {isLoading
              ? "Finalizing..."
              : action === PersonalityBuildActionTrigger.GET_CURRENT_PERSONALITY
              ? "Save Personality"
              : "Finalize Conversational & Save Personality"}
          </button>
        </div>
      </div>
    </div>
  );
};
