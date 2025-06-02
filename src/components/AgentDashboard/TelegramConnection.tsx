import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { ConversationReview } from "./ConversationReview";
import { Conversation, ConversationByPlatform } from "@/types";

const PrivyTelegramAuth = dynamic(
  () => import("@/components/Telegram/PrivyTelegramAuth"),
  { ssr: false }
);

interface TelegramConfig {
  botToken: string;
  status: string;
  webhookConfigured: boolean;
  botUsername?: string;
  telegramOwner?: TelegramOwner;
}

interface TelegramOwner {
  telegramUserId: string;
  username: string | null;
  name: string | null;
  photoUrl: string | null;
  lastLogin: string;
}

interface TelegramConnectionProps {
  agent: any;
  refetchAgent: () => void;
  conversations: ConversationByPlatform;
  refetchConversations: () => void;
}

export const TelegramConnection = ({
  conversations,
  agent,
  refetchAgent,
  refetchConversations,
}: TelegramConnectionProps) => {
  const [configuring, setConfiguring] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [botToken, setBotToken] = useState("");
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig | null>(
    null
  );
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authUserData, setAuthUserData] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [conversationsTelegram, setConversationsTelegram] = useState<
    Conversation[]
  >(conversations.telegram);
  const [platform, setPlatform] = useState<
    "farcaster" | "twitter" | "telegram"
  >("telegram");

  useEffect(() => {
    setConversationsTelegram(conversations.telegram);
  }, [conversations]);

  const handlePlatformChange = (
    platform: "farcaster" | "twitter" | "telegram"
  ) => {
    setPlatform(platform);
  };

  const fetchTelegramConfig = async (agentId: string) => {
    try {
      const response = await axios.get(
        `/api/telegram-config?agentId=${agentId}`
      );
      console.log("Respuesta API Telegram:", response.data);
      setTelegramConfig(response.data);
      if (response.data?.botToken) {
        setBotToken(response.data.botToken);
      }
    } catch (err) {
      console.error("Error fetching Telegram config:", err);
    }
  };

  const configureTelegramBot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!botToken.trim()) {
      setError("Please enter a valid bot token");
      return;
    }

    if (!agent?.agentId) {
      setError("Agent ID not found");
      return;
    }

    try {
      setConfiguring(true);
      setError(null);
      setSuccess(null);

      const clientResponse = await axios.post("/api/telegram-config", {
        agentId: agent.agentId,
        botToken: botToken.trim(),
      });

      if (clientResponse.data.success) {
        const webhookBaseUrl =
          "https://development-telegram-webhook-api-422317649866.us-central1.run.app";
        const webhookUrl = `${webhookBaseUrl}/telegram/webhook?token=${botToken.trim()}`;

        await axios.post("/api/telegram-config/webhook", {
          agentId: agent.agentId,
          webhookUrl,
        });

        await axios.post("/api/telegram-config/menu-button", {
          agentId: agent.agentId,
          webAppUrl: `https://miniapp-pied.vercel.app/`,
          buttonText: `View Agent`,
        });

        fetchTelegramConfig(agent.agentId);
        setSuccess(
          "Telegram bot configured successfully! Users can now connect using the login button below."
        );
      }
    } catch (err: any) {
      console.error("Error configuring Telegram:", err);
      setError(err.response?.data?.error || "Failed to configure Telegram bot");
    } finally {
      setConfiguring(false);
    }
  };

  const handleTelegramAuthCallback = (success: boolean | any, data?: any) => {
    if (typeof success === "object" && success !== null) {
      data = success;
      success = true;
    }

    setAuthSuccess(success);
    setAuthError(null);

    if (success && data) {
      setAuthUserData(data);

      if (data.authData && agent?.agentId && telegramConfig) {
        const updatedConfig: TelegramConfig = {
          ...telegramConfig,
          telegramOwner: data.authData,
        };

        setTelegramConfig(updatedConfig);
        fetchTelegramConfig(agent.agentId);
      } else if (agent?.agentId) {
        fetchTelegramConfig(agent.agentId);
      }
    } else if (!success && data && data.error) {
      setAuthError(
        typeof data.error === "string" ? data.error : "Authentication failed"
      );
    }
  };

  useEffect(() => {
    if (agent?.agentId) {
      fetchTelegramConfig(agent.agentId);
    }
  }, [agent?.agentId]);

  // Actualizar el paso actual basado en el estado de la configuración
  useEffect(() => {
    console.log("Estado actual telegramConfig:", telegramConfig);
    console.log(
      "Condición evaluada:",
      !telegramConfig || telegramConfig?.status !== "active"
    );

    if (!telegramConfig || telegramConfig?.status !== "active") {
      setCurrentStep(1); // Paso 1: Configurar el bot
    } else if (
      telegramConfig?.status === "active" &&
      !telegramConfig?.telegramOwner
    ) {
      setCurrentStep(2); // Paso 2: Conectar usuario de Telegram
    } else if (
      telegramConfig?.status === "active" &&
      telegramConfig?.telegramOwner
    ) {
      setCurrentStep(3); // Paso 3: Completado
    }
  }, [telegramConfig]);

  // const handleTagAdd = (conversationId: string, tag: string) => {
  //   setConversationsTelegram((prev) =>
  //     prev.map((conv) =>
  //       conv.id === conversationId
  //         ? { ...conv, tags: [...conv.tags, tag] }
  //         : conv
  //     )
  //   );
  // };

  // const handleTagRemove = (conversationId: string, tag: string) => {
  //   setConversationsTelegram((prev) =>
  //     prev.map((conv) =>
  //       conv.id === conversationId
  //         ? { ...conv, tags: conv.tags.filter((t) => t !== tag) }
  //         : conv
  //     )
  //   );
  // };

  const handleRatingChange = (conversationId: string, rating: number) => {
    setConversationsTelegram((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, rating } : conv
      )
    );
  };

  const handleFeedbackSubmit = (conversationId: string, feedback: string) => {
    setConversationsTelegram((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, feedback } : conv
      )
    );
  };

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)] p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-4">
        Telegram Connection
      </h2>

      {/* Indicador de pasos */}
      <div className="mt-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 1
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              } font-medium`}
            >
              1
            </div>
            <span className="mt-1 text-xs text-gray-600">Configure Bot</span>
          </div>

          <div className="flex-grow mx-2 h-0.5 bg-gray-200">
            <div
              className={`h-full ${
                currentStep >= 2 ? "bg-blue-500" : "bg-gray-200"
              }`}
              style={{
                width: currentStep >= 2 ? "100%" : "0%",
                transition: "width 0.5s ease-in-out",
              }}
            ></div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 2
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              } font-medium`}
            >
              2
            </div>
            <span className="mt-1 text-xs text-gray-600">Connect User</span>
          </div>

          <div className="flex-grow mx-2 h-0.5 bg-gray-200">
            <div
              className={`h-full ${
                currentStep >= 3 ? "bg-blue-500" : "bg-gray-200"
              }`}
              style={{
                width: currentStep >= 3 ? "100%" : "0%",
                transition: "width 0.5s ease-in-out",
              }}
            ></div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 3
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600"
              } font-medium`}
            >
              3
            </div>
            <span className="mt-1 text-xs text-gray-600">Completed</span>
          </div>
        </div>
      </div>

      {/* Modificada la condición para asegurar que el formulario se muestre correctamente */}
      {(!telegramConfig || telegramConfig.status !== "active") && (
        <>
          <div className="w-full p-3 bg-blue-50 rounded-lg mb-4">
            <p className="text-xs text-blue-700 text-center">
              <strong>Step 1:</strong> Configure your Telegram bot to enable
              integration
            </p>
          </div>
          <form onSubmit={configureTelegramBot} className="space-y-4">
            <div>
              <label
                htmlFor="botToken"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bot Token
              </label>
              <input
                id="botToken"
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="1234567890:AAAA-BBB_CCCDDDEEEFFFGGGHHHIIIJJJ"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={configuring}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-300 disabled:bg-blue-300"
              >
                {configuring ? "Configuring..." : "Configure Agent"}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg">
                {success}
              </div>
            )}
          </form>
        </>
      )}

      {telegramConfig?.status === "active" &&
        !telegramConfig?.telegramOwner && (
          <div className="mt-6">
            <div className="w-full p-3 bg-blue-50 rounded-lg mb-4">
              <p className="text-xs text-blue-700 text-center">
                <strong>Step 2:</strong> Connect your Telegram account to
                identify yourself
              </p>
            </div>
            <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg">
              {agent?.agentId && (
                <PrivyTelegramAuth
                  agentId={agent.agentId}
                  onSuccess={handleTelegramAuthCallback}
                  onError={(error) => setAuthError(error)}
                />
              )}
            </div>

            {authError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                {authError}
              </div>
            )}
          </div>
        )}

      {telegramConfig?.status === "active" && telegramConfig?.telegramOwner && (
        <div className="mt-6">
          <div className="w-full p-3 bg-green-50 rounded-lg mb-4">
            <p className="text-xs text-green-700 text-center">
              <strong>¡Completed!</strong> Your agent is fully connected to
              Telegram
            </p>
          </div>
          <div className="flex items-center justify-center py-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="text-base font-medium text-gray-800 mb-2">
                Connected as:{" "}
                {telegramConfig.telegramOwner.name ||
                  telegramConfig.telegramOwner.username ||
                  "Telegram User"}
              </div>
              <button
                onClick={() => {
                  // Implementar lógica para desconectar si es necesario
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-300"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-start gap-3">
        <div className="flex flex-col flex-grow min-w-[120px]">
          {conversationsTelegram?.length > 0 && (
            <ConversationReview
              conversations={conversations}
              platform={platform}
              onRatingChange={handleRatingChange}
              onFeedbackSubmit={handleFeedbackSubmit}
              onPlatformChange={handlePlatformChange}
              agent={agent}
              refetchConversations={refetchConversations}
            />
          )}
        </div>
      </div>
    </div>
  );
};
