// react
import { useCallback, useEffect, useState } from "react";

// next
import Image from "next/image";

// types
import { Agent, Conversation, ConversationByPlatform } from "@/types";

// shadcn
import { Calendar, Check, Loader2, UserCircle, X } from "lucide-react";

// utils

// css
import "./sign-in.css";

// farcaster
import { SignInButton, StatusAPIResponse } from "@farcaster/auth-kit";
import { Signer } from "@neynar/nodejs-sdk/build/api";

// axios
import axios from "axios";

// next-auth
import { signIn, signOut } from "next-auth/react";

// components
import FarcasterConnectionModal from "./FarcasterConnectionModal";
import SocialMediaScheduleModal from "./SocialMediaScheduleModal";
import { cn } from "@/lib/utils";
import { ConversationReview } from "./ConversationReview";
import Link from "next/link";

interface FarcasterUser {
  username: string;
  pfp_url: string;
  fid: number;
  display_name: string;
  public_key?: string;
  signer_approval_url?: string;
  signer_uuid?: string;
  status?: string;
}

export function FarcasterConnection({
  agent,
  refetchAgent,
  conversations,
  refetchConversations,
}: {
  agent: Agent;
  refetchAgent: () => void;
  conversations: ConversationByPlatform;
  refetchConversations: () => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "pending_approval" | "approved" | "error"
  >("pending_approval");
  const [farcasterUri, setFarcasterUri] = useState("");
  const [activateLoading, setActivateLoading] = useState(false);
  const [conversationsFarcaster, setConversationsFarcaster] = useState<
    Conversation[]
  >([]);
  const [platform, setPlatform] = useState<
    "farcaster" | "twitter" | "telegram"
  >("farcaster");

  useEffect(() => {
    setConversationsFarcaster(conversations.farcaster);
  }, [conversations]);

  const openFarcasterModal = async () => {
    if (!farcasterUser || !farcasterUser.signer_approval_url) return;
    try {
      // Get URI for QR code
      setFarcasterUri(farcasterUser?.signer_approval_url || "");
      setConnectionStatus("pending_approval");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error getting Farcaster URI:", error);
    }
  };

  const handleSuccess = useCallback(
    async (res: StatusAPIResponse) => {
      await signIn("credentials", {
        message: res.message,
        signature: res.signature,
        name: res.username,
        pfp: res.pfpUrl,
        nonce: res.nonce,
        redirect: false,
      });
      setIsConnected(true);
      if (!res.username || !res.pfpUrl || !res.fid || !res.displayName) return;

      // Actualizar el estado local primero
      const newFarcasterUser = {
        username: res.username,
        pfp_url: res.pfpUrl,
        fid: res.fid,
        display_name: res.displayName,
      };

      setFarcasterUser(newFarcasterUser);

      // Intentar crear el signer solo una vez
      try {
        const response = await axios.post("/api/signer-farcaster", {
          user: newFarcasterUser,
          agentId: agent.agentId,
        });

        if (response.status === 200) {
          const userWithStatus = {
            ...newFarcasterUser,
            ...response.data,
          };
          setFarcasterUser(userWithStatus);
        }
      } catch (error) {
        console.error("Error al crear el signer:", error);
        // No intentar nuevamente para evitar el bucle
      }
    },
    [setIsConnected, setFarcasterUser, agent.agentId]
  );

  const handleLogout = () => {
    signOut({ redirect: false });
    setFarcasterUser(null);
    setIsConnected(false);
  };

  const handleActivateAgent = async () => {
    setActivateLoading(true);
    try {
      const isCurrentlyActive = agent.farcasterClient?.active;
      const response = await axios.post(
        `/api/agents/${agent.agentId}/farcaster/activate`,
        {
          active: !isCurrentlyActive,
        }
      );

      if (response.status === 200) {
        refetchAgent();
      }
    } catch (error) {
      console.error("Error activating agent:", error);
    } finally {
      refetchAgent();
      setActivateLoading(false);
    }
  };

  // Evitar renderizaciones innecesarias que podrían causar bucles
  const memoizedHandleSuccess = useCallback(handleSuccess, [handleSuccess]);

  /* GET SIGNER STATUS */
  useEffect(() => {
    if (
      farcasterUser &&
      farcasterUser.status === "pending_approval" &&
      isModalOpen
    ) {
      let intervalId: NodeJS.Timeout;

      const startPolling = () => {
        intervalId = setInterval(async () => {
          try {
            const response = await axios.get(
              `/api/signer-farcaster?signer_uuid=${farcasterUser?.signer_uuid}`
            );
            const signer = response.data as Signer;

            if (signer?.status === "approved") {
              // store the user in local storage
              setIsModalOpen(false);
              setConnectionStatus("approved");
              const newFarcasterUser = {
                ...farcasterUser,
                ...signer,
              };
              setFarcasterUser(newFarcasterUser);
              const updateUser = async () => {
                await axios.put(`/api/signer-farcaster`, {
                  agentId: agent.agentId,
                  user: newFarcasterUser,
                });
              };
              updateUser();
              refetchAgent();
              clearInterval(intervalId);
            }
          } catch (error) {
            console.error("Error during polling", error);
          }
        }, 5000);
      };

      const stopPolling = () => {
        clearInterval(intervalId);
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopPolling();
        } else {
          startPolling();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Start the polling when the effect runs.
      startPolling();

      // Cleanup function to remove the event listener and clear interval.
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        clearInterval(intervalId);
      };
    }
  }, [farcasterUser, isModalOpen]);

  console.log(agent);

  // if (!agent.farcasterClient) {
  if (!agent.farcasterClient || agent.farcasterClient.status !== "approved") {
    return (
      <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 ">
              <Image
                src="/assets/logos/farcaster.png"
                alt="Farcaster"
                width={20}
                height={20}
                className="h-5 w-5"
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-800">Farcaster</h3>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mt-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isConnected
                    ? "bg-green-100 text-green-600"
                    : "bg-purple-100 text-purple-600"
                } font-medium`}
              >
                1
              </div>
              <span className="mt-1 text-xs text-gray-600">Connect</span>
            </div>

            <div className="flex-grow mx-2 h-0.5 bg-gray-200">
              <div
                className={`h-full ${
                  isConnected ? "bg-green-500" : "bg-gray-200"
                }`}
                style={{
                  width: isConnected ? "100%" : "0%",
                  transition: "width 0.5s ease-in-out",
                }}
              ></div>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  farcasterUser?.status === "approved"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-600"
                } font-medium`}
              >
                2
              </div>
              <span className="mt-1 text-xs text-gray-600">Authorize</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center justify-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 ">
            <UserCircle className="h-10 w-10 text-purple-500" />
          </div>

          {!isConnected ? (
            <>
              <div className="w-full p-3 bg-blue-50 rounded-lg mb-2">
                <p className="text-xs text-blue-700 text-center">
                  <strong>Step 1:</strong> Connect your Farcaster account to
                  identify yourself
                </p>
              </div>
              <SignInButton onSuccess={memoizedHandleSuccess} />
            </>
          ) : farcasterUser?.status !== "approved" ? (
            <>
              <div className="w-full p-3 bg-blue-50 rounded-lg mb-2">
                <p className="text-xs text-blue-700 text-center">
                  <strong>Step 2:</strong> Authorize the agent to post on your
                  behalf
                </p>
              </div>
              <div className="flex flex-col w-full gap-2">
                <button
                  onClick={openFarcasterModal}
                  className="w-full rounded-lg bg-purple-600 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-purple-700"
                >
                  Authorize Posting
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-red-300 bg-transparent px-4 py-2 text-center font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Disconnect
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-full p-3 bg-green-50 rounded-lg mb-2">
                <p className="text-xs text-green-700 text-center">
                  <strong>Completed!</strong> Your agent is fully connected to
                  Farcaster
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-red-700"
              >
                Disconnect Farcaster
              </button>
            </>
          )}

          <p className="text-sm text-gray-500 mt-4 font-medium">
            {!isConnected
              ? "Connect your Farcaster account to enable social features"
              : farcasterUser?.status === "approved"
              ? "Your Farcaster account is fully connected and authorized"
              : "Connected as @" +
                farcasterUser?.username +
                ". Now authorize the agent to post"}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm border border-purple-100">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-base font-medium text-gray-800">
                  Tagged
                </span>
              </div>

              <p className="text-sm text-gray-600 pl-7">
                Respond when you are tagged
              </p>
            </div>

            <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm border border-purple-100">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-base font-medium text-gray-800">
                  Commented
                </span>
              </div>

              <p className="text-sm text-gray-600 pl-7">
                Respond when someone comments on your cast
              </p>
            </div>

            <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm border border-purple-100">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-base font-medium text-gray-800">
                  Schedule posts
                </span>
              </div>

              <p className="text-sm text-gray-600 pl-7">
                Schedule your casts for future publication about an specific
                topic
              </p>
            </div>

            <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm border border-purple-100">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                </div>
                <span className="text-base font-medium text-gray-800">
                  Engagement with content
                </span>
              </div>
              <p className="text-sm text-gray-600 pl-7">
                Soon - Automatic engagement
              </p>
            </div>
          </div>
        </div>
        <FarcasterConnectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          uri={farcasterUri}
          status={connectionStatus}
        />
      </div>
    );
  }

  // const handleTagAdd = (conversationId: string, tag: string) => {
  //   setConversationsFarcaster((prev) =>
  //     prev.map((conv) =>
  //       conv.id === conversationId
  //         ? { ...conv, tags: [...conv.tags, tag] }
  //         : conv
  //     )
  //   );
  // };

  // const handleTagRemove = (conversationId: string, tag: string) => {
  //   setConversationsFarcaster((prev) =>
  //     prev.map((conv) =>
  //       conv.id === conversationId
  //         ? { ...conv, tags: conv.tags.filter((t) => t !== tag) }
  //         : conv
  //     )
  //   );
  // };

  const handleRatingChange = (conversationId: string, rating: number) => {
    setConversationsFarcaster((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, rating } : conv
      )
    );
  };

  const handleFeedbackSubmit = (conversationId: string, feedback: string) => {
    setConversationsFarcaster((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, feedback } : conv
      )
    );
  };

  const handlePlatformChange = (
    platform: "farcaster" | "twitter" | "telegram"
  ) => {
    setPlatform(platform);
  };

  return (
    <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
            <Image
              src="/assets/logos/farcaster.png"
              alt="Farcaster"
              width={20}
              height={20}
              className="h-5 w-5"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Farcaster</h3>
        </div>

        <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600">
          <Check className="h-3.5 w-3.5" />
          Connected
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-3">
        <div className="relative h-16 w-16 flex-shrink-0">
          <Image
            src={agent.farcasterClient.pfp_url}
            alt={agent.farcasterClient.display_name}
            className="h-full w-full rounded-full object-cover"
            width={64}
            height={64}
          />

          <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-purple-500 p-1">
            <Check className="h-3 w-3 text-white" />
          </div>
        </div>

        <div className="flex flex-col flex-grow min-w-[120px]">
          {/* <h4 className="text-lg font-bold text-gray-900">
            {agent.farcasterClient.display_name}
          </h4> */}
          <Link
            href={`https://warpcast.com/${agent.farcasterClient.username}`}
            target="_blank"
            className="text-lg font-medium text-purple-600 hover:underline"
          >
            @{agent.farcasterClient.username}
          </Link>

          <div className="mt-1.5 flex gap-2">
            <button
              className={cn(
                "w-fit flex items-center gap-1 rounded-lg border  bg-transparent px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                !agent.farcasterClient.active
                  ? "border-green-300  text-green-600 hover:bg-green-50"
                  : "border-rose-300 text-rose-600 hover:bg-rose-50"
              )}
              onClick={handleActivateAgent}
              disabled={activateLoading}
            >
              {activateLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : agent.farcasterClient.active ? (
                <X className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              {activateLoading
                ? "Loading..."
                : agent.farcasterClient.active
                ? "Set inactive"
                : "Set active"}
            </button>

            <button
              className="w-fit rounded-lg border border-purple-300 bg-transparent px-3 py-1 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-50 flex items-center gap-1"
              onClick={() => setIsScheduleModalOpen(true)}
            >
              <Calendar className="h-3 w-3" />
              Schedule Cast
            </button>

            {conversationsFarcaster?.length > 0 && (
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

      <div className="mt-8 border-t border-gray-100 pt-6">
        <h5 className="text-base font-semibold text-gray-800">
          Available Features:
        </h5>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-base font-medium text-gray-800">
                Respond when you are tagged
              </span>
            </div>
            <p className="text-sm text-gray-600 pl-7">
              Respond automatically when you are tagged
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-base font-medium text-gray-800">
                Respond to comments
              </span>
            </div>
            <p className="text-sm text-gray-600 pl-7">
              Interact with comments on your casts
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-base font-medium text-gray-800">
                Schedule posts
              </span>
            </div>
            <p className="text-sm text-gray-600 pl-7">
              Schedule your casts for future publication
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              </div>
              <span className="text-base font-medium text-gray-800">
                Engagement with content
              </span>
            </div>
            <p className="text-sm text-gray-600 pl-7">
              Soon - Automatic engagement
            </p>
          </div>
        </div>
      </div>

      {agent.agentId && (
        <SocialMediaScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          agentId={agent.agentId}
          platform="farcaster"
          refetchAgent={refetchAgent}
        />
      )}
    </div>
  );
}
