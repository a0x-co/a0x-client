"use client";

// React
import { Suspense, useEffect, useMemo, useState } from "react";

// Next
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

// Components
// components
import { FarcasterConnection } from "@/components/AgentDashboard/FarcasterConnection";
import { FarcasterScheduledCasts } from "@/components/AgentDashboard/FarcasterScheduledCasts";

import { Header } from "@/components/AgentDashboard/Header";
import { KnowledgeChart } from "@/components/AgentDashboard/KnowledgeChart";
import { TelegramConnection } from "@/components/AgentDashboard/TelegramConnection";
import { TokenSection } from "@/components/AgentDashboard/TokenSection";

// Shadcn components
import { TwitterConnection } from "@/components/AgentDashboard/TwitterConnection";
import { TwitterScheduledPosts } from "@/components/AgentDashboard/TwitterScheduledPosts";
import { ZoraCoinsConnection } from "@/components/AgentDashboard/ZoraCoinsConnection";
import { ZoraCoinsManager } from "@/components/AgentDashboard/ZoraCoinsManager";
import { AgentPersonality } from "@/components/AgentDetails/AgentPersonality";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";

import { ManualActions } from "@/components/AgentDashboard/QualifyAndAnnounceGrantWinnersAction/QAGWActions";

import Spinner from "@/components/Spinner";

// Types
import {
  Agent,
  AgentPersonalityConfig,
  AgentPersonalityElizaFormat,
  ConversationByPlatform,
  Grant,
} from "@/types";

// React-query
import { useQuery } from "@tanstack/react-query";

// Icons

// icons
import { ArrowLeft, Wallet } from "lucide-react";

// Wagmi
import { useAccount } from "wagmi";
// wagmi

// Icons

// icons

import { GrantManagement } from "@/components/AgentDashboard/Grants/GrantManager";
import FarcasterIcon from "@/components/Icons/FarcasterIcon";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import { FaTelegram } from "react-icons/fa";
import { FaCoins, FaXTwitter } from "react-icons/fa6";
import { DotsAnimation } from "@/components/Icons/DotsAnimation";

// Privy

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const getAgent = async (handle: string): Promise<Agent> => {
  try {
    const response = await fetch(`${BASE_URL}/api/agents?name=${handle}`);
    const agent = await response.json();

    if (!agent) {
      throw new Error("Agent not found");
    }
    return agent;
  } catch (error) {
    console.error("Error fetching agent:", error);
    throw error;
  }
};

const getPersonality = async (
  handle: string
): Promise<AgentPersonalityElizaFormat | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/personality-agent?handle=${handle}`
    );
    const personality = await response.json();
    return personality;
  } catch (error) {
    console.error("Error fetching personality:", error);
    return null;
  }
};

const sendCreatorAddress = async (
  agentId: string,
  creatorAddress: string,
  authType: string
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/agents/${agentId}/${authType}/creator-address`,
      {
        method: "POST",
        body: JSON.stringify({ creatorAddress, agentId }),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending Twitter auth:", error);
    return null;
  }
};

const getConversationsByAgentId = async (agentId: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/agents/${agentId}/conversations`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return null;
  }
};

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = usePrivy();

  const { wallets } = useWallets();
  const handle = params.handle as string;
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Detectar si el acceso es a través de Twitter o Farcaster
  const isTwitterAuth = searchParams.get("auth") === "twitter";
  const isFarcasterAuth = searchParams.get("auth") === "farcaster";

  const {
    data: agent,
    isLoading: isAgentLoading,
    refetch: refetchAgent,
  } = useQuery({
    queryKey: ["agent", handle],
    queryFn: () => {
      if (!handle) {
        return null;
      }
      return getAgent(handle);
    },
    enabled: !!handle,
  });

  const { data: personality, isLoading: isPersonalityLoading } = useQuery({
    queryKey: ["personality", handle],
    queryFn: () => {
      if (!handle) {
        return null;
      }
      return getPersonality(handle);
    },
    enabled: !!handle,
  });

  const {
    data: conversationsData,
    isLoading: isConversationsLoading,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ["conversations", agent?.agentId],
    queryFn: () => {
      if (!agent?.agentId) {
        return null;
      }
      return getConversationsByAgentId(agent.agentId);
    },
    enabled: !!agent?.agentId,
  });

  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
    }
  }, [conversationsData]);

  const [config, setConfig] = useState<AgentPersonalityConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("farcaster");
  const [conversations, setConversations] = useState<ConversationByPlatform>({
    farcaster: [],
    twitter: [],
    telegram: [],
  });

  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
    }
  }, [conversationsData]);

  useEffect(() => {
    const authTimer = setTimeout(() => {
      if (!hasCheckedAuth) {
        if (isTwitterAuth) {
          if (!user) {
            const errorMsg =
              "You need to sign in with Twitter to access this page";
            setAuthError(errorMsg);
            console.error(errorMsg);
            // No redirigimos para permitir que el usuario se conecte a través del Navbar
            return;
          }

          if (agent && user?.twitter) {
            // Verificar si el agente fue creado con esta cuenta de Twitter
            if (agent.twitterClient?.creatorUsername) {
              const isTwitterOwner =
                user.twitter.username === agent.twitterClient.creatorUsername;
              if (!isTwitterOwner) {
                const errorMsg =
                  "You do not have permission to access this agent's dashboard with your Twitter account";
                setAuthError(errorMsg);
                console.error(errorMsg);
                // router.push(`/agent/${handle}`);
                return;
              } else if (agent.agentId && user.wallet?.address) {
                sendCreatorAddress(
                  agent.agentId,
                  user.wallet.address,
                  "twitter"
                );
                console.log("🔍 isTwitterOwner", isTwitterOwner);
              }
            } else {
              const errorMsg =
                "This agent does not have a Twitter account associated with it";
              setAuthError(errorMsg);
              console.error(errorMsg);
              // router.push(`/agent/${handle}`);
              return;
            }
          }
        }
        // Verificación para autenticación con Farcaster
        else if (isFarcasterAuth) {
          if (!user) {
            const errorMsg =
              "You need to sign in with Farcaster to access this page";
            setAuthError(errorMsg);
            console.error(errorMsg);
            return;
          }

          if (agent && user?.farcaster) {
            if (agent.farcasterClient?.creator_fid) {
              const isFarcasterOwner =
                user.farcaster.fid === agent.farcasterClient.creator_fid;
              if (!isFarcasterOwner) {
                const errorMsg =
                  "You do not have permission to access this agent's dashboard with your Farcaster account";
                setAuthError(errorMsg);
                console.error(errorMsg);
                return;
              } else if (agent.agentId && user.wallet?.address) {
                sendCreatorAddress(
                  agent.agentId,
                  user.wallet.address,
                  "farcaster"
                );
                console.log("🔍 isFarcasterOwner", isFarcasterOwner);
              }
            } else {
              const errorMsg =
                "This agent does not have a Farcaster account associated with it";
              setAuthError(errorMsg);
              console.error(errorMsg);
              return;
            }
          }
        }
        // Verificación estándar con wallet
        else {
          if (wallets.length === 0 || !wallets[0].address) {
            const errorMsg =
              "You must be connected to the network to access this page";
            setAuthError(errorMsg);
            console.error(errorMsg);

            return;
          }

          if (agent) {
            console.log("🔍 agent", agent);
            if (!agent.creatorAddress) {
              const errorMsg = "This agent does not have an owner assigned";
              setAuthError(errorMsg);
              console.error(errorMsg);
              // router.push(`/agent/${handle}`);
              return;
            }

            const addressLower = wallets[0].address.toLowerCase();
            let isOwner = false;

            if (Array.isArray(agent.creatorAddress)) {
              isOwner = agent.creatorAddress.some((addr) => {
                if (typeof addr === "string") {
                  return addressLower === addr.toLowerCase();
                }
                return false;
              });
            } else {
              // Convertir a string explícitamente
              const creatorAddressString = String(agent.creatorAddress);
              isOwner = addressLower === creatorAddressString.toLowerCase();
            }

            if (!isOwner) {
              const errorMsg =
                "You do not have permission to access this agent's dashboard";
              setAuthError(errorMsg);
              console.error(errorMsg);
              router.push(`/agent/${handle}`);
              return;
            }
          }
        }

        setHasCheckedAuth(true);
      }

      setIsCheckingAuth(false);
    }, 5000);

    return () => clearTimeout(authTimer);
  }, [
    agent,
    wallets,
    handle,
    router,
    hasCheckedAuth,
    user,
    isTwitterAuth,
    isFarcasterAuth,
  ]);

  // Función para verificar si el usuario tiene acceso
  const hasAccess = useMemo(() => {
    if (
      isTwitterAuth &&
      user?.twitter &&
      (agent?.twitterClient?.creatorUsername || agent?.twitterClient?.username)
    ) {
      return (
        user.twitter.username === agent.twitterClient.creatorUsername ||
        user.twitter.username === agent.twitterClient.username
      );
    } else if (
      isFarcasterAuth &&
      user?.farcaster &&
      agent?.farcasterClient?.creator_fid
    ) {
      return user.farcaster.fid === agent.farcasterClient.creator_fid;
    } else if (
      !isTwitterAuth &&
      !isFarcasterAuth &&
      wallets.length > 0 &&
      wallets[0].address &&
      agent?.creatorAddress
    ) {
      const addressLower = wallets[0].address.toLowerCase();

      if (Array.isArray(agent.creatorAddress)) {
        return agent.creatorAddress.some((addr) => {
          if (typeof addr === "string") {
            return addressLower === addr.toLowerCase();
          }
          return false;
        });
      } else {
        // Convertir a string explícitamente
        const creatorAddressString = String(agent.creatorAddress);
        return addressLower === creatorAddressString.toLowerCase();
      }
    }
    return false;
  }, [
    agent,
    wallets,
    isTwitterAuth,
    isFarcasterAuth,
    user?.twitter,
    user?.farcaster,
  ]);

  useEffect(() => {
    if (agent && personality) {
      setIsLoading(false);
    }
  }, [agent, personality]);

  const [originalPersonality, setOriginalPersonality] =
    useState<AgentPersonalityConfig>();

  useEffect(() => {
    if (personality) {
      const requiredPersonalityFields = {
        system: personality.system || "",
        bio: personality.bio || [],
        lore: personality.lore || [],
        style: {
          all: personality.style?.all || [],
          chat: personality.style?.chat || [],
          post: personality.style?.post || [],
        },
        knowledge: personality.knowledge || [],
        topics: personality.topics || [],
        messageExamples: personality.messageExamples || [],
        postExamples: personality.postExamples || [],
        adjectives: personality.adjectives || [],
      };
      setConfig(requiredPersonalityFields);
      setOriginalPersonality(requiredPersonalityFields);
    }
  }, [personality]);

  const grantsData = useMemo(() => {
    if (!agent || agent.name !== "jessexbt") return [];
    const { lastUpdated, ...rest } = agent.githubMetrics;
    const githubMetricsWithoutLastUpdated: Grant[] = Object.values(rest).filter(
      (value): value is Grant => {
        if (!value || typeof value !== "object") return false;
        const grant = value as any;
        return !!grant.metrics?.repository;
      }
    );

    const grantsFromUrlAnalysis = agent.urlAnalysis;
    const grantsMixed = [
      ...githubMetricsWithoutLastUpdated,
      ...grantsFromUrlAnalysis,
    ];

    return grantsMixed;
  }, [agent]);

  return (
    <main className="min-h-screen w-[99vw] overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50">
      {authError && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-50">
          {authError}
        </div>
      )}

      {isCheckingAuth ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner />

          {isTwitterAuth ? (
            <p className="ml-2">Verifying your Twitter account...</p>
          ) : isFarcasterAuth ? (
            <p className="ml-2">Verifying your Farcaster account...</p>
          ) : (
            <div className="flex items-center gap-2">
              Verifying connection
              <DotsAnimation />
            </div>
          )}
        </div>
      ) : isTwitterAuth && !user ? (
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
            <FaXTwitter className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <h2 className="text-2xl font-bold mb-4">
              You need to sign in with Twitter
            </h2>
            <p className="mb-6 text-gray-600">
              To access this agent&apos;s dashboard, you need to sign in with
              the Twitter account that created it. Use the &quot;Connect&quot;
              button in the navigation bar.
            </p>
          </div>
        </div>
      ) : isFarcasterAuth && !user ? (
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
            <FarcasterIcon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <h2 className="text-2xl font-bold mb-4">
              You need to sign in with Farcaster
            </h2>
            <p className="mb-6 text-gray-600">
              To access this agent&apos;s dashboard, you need to sign in with
              the Farcaster account that created it. Use the &quot;Connect&quot;
              button in the navigation bar.
            </p>
          </div>
        </div>
      ) : !isTwitterAuth &&
        !isFarcasterAuth &&
        wallets.length > 0 &&
        !wallets[0].address ? (
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-700" />
            <h2 className="text-2xl font-bold mb-4">
              You need to connect your wallet
            </h2>
            <p className="mb-6 text-gray-600">
              To access this agent&apos;s dashboard, you need to connect the
              wallet that created it. Use the &quot;Connect&quot; button in the
              navigation bar.
            </p>
          </div>
        </div>
      ) : !hasAccess ? (
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-red-600">
              Access Denied
            </h2>

            <p className="mb-6 text-gray-600">
              You do not have permission to access this agent&apos;s dashboard.
              Only the creator of this agent can access its dashboard.
            </p>
            <Link
              href={`/agent/${handle}`}
              className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-full transition-colors duration-300"
            >
              Go back to agent page
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            {agent && (
              <Link
                href={`/`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                       bg-white text-gray-700 transition-all duration-300 
                       border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)]
                       hover:shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_8px_20px_rgba(59,130,246,0.1)]
                       hover:border-blue-100 hover:text-blue-600 w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            )}
          </div>

          <div
            className="rounded-[20px] bg-white border border-gray-100
                         shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)] p-6 mb-8"
          >
            {isLoading && <Spinner />}
            {!isLoading && agent && (
              <Header agent={agent} refetchAgent={refetchAgent} />
            )}
          </div>

          <Suspense fallback={<Spinner />}>
            {personality && agent && config && (
              <div className="flex flex-col gap-8 w-full">
                <KnowledgeChart agent={agent} refetchAgent={refetchAgent} />

                {/* {agent.name === "jessexbt" && <ManualActions agent={agent} />} */}

                {agent.token && <TokenSection agent={agent} />}

                <div className="rounded-[20px] bg-white border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)] p-6">
                  <Tabs
                    defaultValue="farcaster"
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="mb-2">
                      <TabsTrigger
                        value="farcaster"
                        className="flex items-center gap-2"
                      >
                        <FarcasterIcon className="w-4 h-4" />
                        Farcaster
                      </TabsTrigger>
                      <TabsTrigger
                        value="twitter"
                        className="flex items-center gap-2"
                      >
                        <FaXTwitter className="w-4 h-4" />
                        Twitter
                      </TabsTrigger>
                      <TabsTrigger
                        value="telegram"
                        className="flex items-center gap-2"
                      >
                        <FaTelegram className="w-4 h-4" />
                        Telegram
                      </TabsTrigger>
                      {agent.name === "jessexbt" && (
                        <TabsTrigger
                          value="grants"
                          className="flex items-center gap-2"
                        >
                          <FaCoins className="w-4 h-4" />
                          Grants
                        </TabsTrigger>
                      )}
                      <TabsTrigger
                        value="zoracoins"
                        className="flex items-center gap-2"
                      >
                        <Image
                          src="/assets/logos/zora.png"
                          alt="Zora"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                        Zora
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="farcaster" className="space-y-6">
                      <FarcasterConnection
                        agent={agent}
                        refetchAgent={refetchAgent}
                        conversations={conversations}
                        refetchConversations={refetchConversations}
                      />

                      {agent.farcasterClient &&
                        agent.farcasterClient.status === "approved" &&
                        agent.agentId && (
                          <>
                            <FarcasterScheduledCasts
                              agent={agent}
                              refetchAgent={refetchAgent}
                            />
                          </>
                        )}
                    </TabsContent>

                    <TabsContent value="twitter" className="space-y-6">
                      <TwitterConnection
                        agent={agent}
                        refetchAgent={refetchAgent}
                        conversations={conversations}
                        refetchConversations={refetchConversations}
                      />

                      {agent.twitterClient &&
                        agent.twitterClient.username &&
                        agent.agentId && (
                          <>
                            <TwitterScheduledPosts
                              agent={agent}
                              refetchAgent={refetchAgent}
                            />
                          </>
                        )}
                    </TabsContent>

                    <TabsContent value="telegram" className="space-y-6">
                      <TelegramConnection
                        agent={agent}
                        refetchAgent={refetchAgent}
                        conversations={conversations}
                        refetchConversations={refetchConversations}
                      />
                    </TabsContent>

                    <TabsContent value="grants" className="space-y-6">
                      <GrantManagement grantsData={grantsData} agent={agent} />
                    </TabsContent>

                    <TabsContent value="zoracoins" className="space-y-6">
                      <ZoraCoinsConnection
                        agent={agent}
                        refetchAgent={refetchAgent}
                      />
                      {wallets.length > 0 && wallets[0].address && (
                        <ZoraCoinsManager
                          agent={agent}
                          refetchAgent={refetchAgent}
                          walletAddress={wallets[0].address}
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                {originalPersonality && (
                  <AgentPersonality
                    agent={agent}
                    config={config}
                    setConfig={setConfig}
                    originalPersonality={originalPersonality}
                    setOriginalPersonality={setOriginalPersonality}
                    from="personality-page"
                  />
                )}
              </div>
            )}
          </Suspense>
        </div>
      )}
    </main>
  );
}
