// next
import Image from "next/image";

// react
import { useEffect, useState } from "react";

// components
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { useToast } from "@/components/shadcn/use-toast";
import Spinner from "../Spinner";
import { ConversationReview } from "./ConversationReview";
import SocialMediaScheduleModal from "./SocialMediaScheduleModal";
import TwitterRefreshModal from "./TwitterRefreshModal";

// types
import { Agent, Conversation, ConversationByPlatform } from "@/types";

// icons
import { AlertCircle, Calendar, Check, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";
interface TwitterConnectionProps {
  agent: Agent;
  conversations: ConversationByPlatform;
  refetchAgent: () => void;
  refetchConversations: () => void;
}

export function TwitterConnection({
  conversations,
  agent,
  refetchAgent,
  refetchConversations,
}: TwitterConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [authCookie, setAuthCookie] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [twid, setTwid] = useState("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRefreshModalOpen, setIsRefreshModalOpen] = useState(false);

  const [conversationsTwitter, setConversationsTwitter] = useState<
    Conversation[]
  >(conversations.twitter);
  const [platform, setPlatform] = useState<
    "farcaster" | "twitter" | "telegram"
  >("twitter");

  useEffect(() => {
    setConversationsTwitter(conversations.twitter);
  }, [conversations]);

  const { toast } = useToast();

  const connectTwitter = async () => {
    if (!authCookie || !csrfToken || !twid) {
      toast({
        title: "Please enter all Twitter cookies",
        variant: "destructive",
      });
      return;
    }

    const decodedTwid = decodeURIComponent(twid);

    setIsConnecting(true);
    try {
      const response = await fetch(
        `/api/agents/${agent.agentId}/twitter/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentId: agent.agentId,
            authCookie,
            csrfToken,
            twid: decodedTwid,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Error connecting to Twitter:", error);
        throw new Error(error.error);
      }

      toast({
        title: "Connected to Twitter successfully",
        variant: "default",
      });
      refetchAgent();
    } catch (error) {
      console.error("Error connecting to Twitter:", error);
      toast({
        title: "Error connecting to Twitter",
        description:
          error instanceof Error
            ? error.message
            : "Error connecting to Twitter",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectTwitter = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch(
        `/api/agents/${agent.agentId}/twitter/disconnect`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Error disconnecting from Twitter:", error);
        throw new Error(error.error);
      }

      toast({
        title: "Disconnected from Twitter successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error disconnecting from Twitter:", error);
      toast({
        title: "Error disconnecting from Twitter",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
      refetchAgent();
    }
  };

  const handleLogout = () => {
    disconnectTwitter();
  };

  const isConnected = agent.twitterClient && agent.twitterClient.username;
  const isExpired = agent.twitterClient?.expired;

  // const handleTagAdd = (conversationId: string, tag: string) => {
  //   setConversationsTwitter((prev) => {
  //     const updated = { ...prev };
  //     updated.tags = [...updated.tags, tag];
  //     return updated;
  //   });
  // };

  // const handleTagRemove = (conversationId: string, tag: string) => {
  //   setConversationsTwitter((prev) => {
  //     const updated = { ...prev };
  //     updated.tags = updated.tags.filter((t) => t !== tag);
  //     return updated;
  //   });
  // };

  const handleRatingChange = (conversationId: string, rating: number) => {
    setConversationsTwitter((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, rating } : conv
      )
    );
  };

  const handleFeedbackSubmit = (conversationId: string, feedback: string) => {
    setConversationsTwitter((prev) =>
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

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 ">
              <FaXTwitter className="h-4 w-4 text-blue-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800">Twitter</h3>
          </div>
        </div>

        {/* Step indicator */}
        <div className="my-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  authCookie && csrfToken && twid
                    ? "bg-green-100 text-green-600"
                    : "bg-blue-100 text-blue-600"
                } font-medium`}
              >
                1
              </div>
              <span className="mt-1 text-xs text-gray-600">Enter Cookies</span>
            </div>

            <div className="flex-grow mx-2 h-0.5 bg-gray-200">
              <div
                className={`h-full ${
                  authCookie && csrfToken && twid
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
                style={{
                  width: authCookie && csrfToken && twid ? "100%" : "0%",
                  transition: "width 0.5s ease-in-out",
                }}
              ></div>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isConnected
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-600"
                } font-medium`}
              >
                2
              </div>
              <span className="mt-1 text-xs text-gray-600">Connect</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center justify-center gap-3 w-full">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 ">
            <FaXTwitter className="h-10 w-10 text-blue-500" />
          </div>

          <p className="text-sm text-gray-500 mt-4 font-medium">
            {!isConnected
              ? "Connect your Twitter account to enable social features"
              : "Connected as @" +
                agent.twitterClient?.username +
                ". Now authorize the agent to post"}
          </p>

          <div className="space-y-4 w-full">
            {/* Información sobre el paso actual */}
            <div className="w-full p-3 bg-blue-50 rounded-lg mb-2">
              <p className="text-xs text-blue-700 text-center">
                <strong>Step 1:</strong> Enter your Twitter cookies to connect
                your account
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="authCookie">Authentication cookie</Label>
              <Input
                id="authCookie"
                placeholder="auth_token=..."
                value={authCookie}
                onChange={(e) => setAuthCookie(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Your Twitter account authentication cookie (auth_token)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="csrfToken">Token CSRF</Label>
              <Input
                id="csrfToken"
                placeholder="ct0=..."
                value={csrfToken}
                onChange={(e) => setCsrfToken(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Your Twitter account CSRF token (ct0)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="twid">Twid</Label>
              <Input
                id="twid"
                placeholder="twid=..."
                value={twid}
                onChange={(e) => setTwid(e.target.value)}
              />
              <p className="text-xs text-gray-500">Your Twitter account twid</p>
            </div>
            <div className="pt-2">
              <Button
                onClick={connectTwitter}
                disabled={isConnecting || !authCookie || !csrfToken || !twid}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white flex items-center justify-center gap-2"
              >
                {isConnecting ? <Spinner /> : null}
                {isConnecting ? "Connecting..." : "Connect to Twitter"}
              </Button>
            </div>
            <div className="rounded-md bg-blue-50 p-3 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    How to get your Twitter cookies
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Login to Twitter.com</li>
                      <li>
                        Open the developer tools (F12 or right-click → Inspect)
                      </li>
                      <li>
                        Go to the `&quot;Application&quot;` or
                        `&quot;Storage&quot;` tab
                      </li>
                      <li>
                        Search for `&quot;Cookies&quot;` and select
                        `&quot;twitter.com&quot;`
                      </li>
                      <li>
                        Copy the value of `&quot;auth_token&quot;`,
                        `&quot;ct0&quot;` and `&quot;twid&quot;`
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 w-full">
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
                Respond when someone comments on your post
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
                Schedule your post for future publication about an specific
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
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <FaXTwitter className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Twitter</h3>
        </div>

        {isExpired ? (
          <span className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-600">
            <AlertCircle className="h-3.5 w-3.5" />
            Expired Credentials
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600">
            <Check className="h-3.5 w-3.5" />
            Connected
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-3">
        <div className="relative h-16 w-16 flex-shrink-0">
          {agent.twitterClient?.profileImageUrl && (
            <Image
              src={agent.twitterClient.profileImageUrl}
              alt={agent.twitterClient.username}
              className="h-full w-full rounded-full object-cover"
              width={64}
              height={64}
            />
          )}

          <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-blue-500 p-1">
            <Check className="h-3 w-3 text-white" />
          </div>
        </div>

        <div className="flex flex-col flex-grow min-w-[120px]">
          {/* <h4 className="text-lg font-bold text-gray-900">
            {agent.twitterClient?.display_name}
          </h4> */}
          <Link
            href={`https://x.com/${agent.twitterClient?.username}`}
            target="_blank"
            className="text-lg font-medium text-blue-600 hover:underline"
          >
            @{agent.twitterClient?.username}
          </Link>

          <div className="mt-1.5 flex gap-2">
            {isExpired ? (
              <button
                className="w-fit rounded-lg border border-yellow-300 bg-transparent px-3 py-1 text-xs font-medium text-yellow-600 transition-colors hover:bg-yellow-50 flex items-center gap-1"
                onClick={() => setIsRefreshModalOpen(true)}
              >
                <RefreshCw className="h-3 w-3" />
                Refresh Credentials
              </button>
            ) : (
              <>
                <button
                  className="w-fit rounded-lg border border-rose-300 bg-transparent px-3 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 flex items-center gap-1"
                  onClick={handleLogout}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                  {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                </button>

                <button
                  className="w-fit rounded-lg border border-blue-300 bg-transparent px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 flex items-center gap-1"
                  onClick={() => setIsScheduleModalOpen(true)}
                >
                  <Calendar className="h-3 w-3" />
                  Schedule Post
                </button>

                {conversationsTwitter?.length > 0 && (
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
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-100 pt-6">
        <h5 className="mb-4 text-base font-semibold text-gray-800">
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
        <>
          <SocialMediaScheduleModal
            isOpen={isScheduleModalOpen}
            platform="twitter"
            onClose={() => setIsScheduleModalOpen(false)}
            agentId={agent.agentId}
            refetchAgent={refetchAgent}
          />
          <TwitterRefreshModal
            isOpen={isRefreshModalOpen}
            onClose={() => setIsRefreshModalOpen(false)}
            agentId={agent.agentId}
            onSuccess={refetchAgent}
          />
        </>
      )}
    </div>
  );
}
