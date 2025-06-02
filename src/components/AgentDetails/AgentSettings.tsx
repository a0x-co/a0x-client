"use client";

// next
import { useRouter } from "next/navigation";
import Image from "next/image";

// react
import { useState, useEffect, useMemo, useCallback } from "react";

// icons
import {
  Heart,
  MessageSquare,
  NotebookPen,
  Play,
  Plug,
  Repeat,
  Save,
  LogOut,
  RefreshCcw,
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import FarcasterIcon from "../Icons/FarcasterIcon";

// types
import { Agent, AgentSettings as AgentSettingsType } from "@/types";

// next-auth
import { signIn, useSession, signOut } from "next-auth/react";

// wagmi
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../shadcn/alert-dialog";
import { cn } from "@/lib/utils";

interface AgentSettingsProps {
  agent: Agent;
  settings: AgentSettingsType;
  account: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    username: string;
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const getUser = async (
  address: string
): Promise<{
  twitterAuth: {
    accessToken: string;
    expiresAt: {
      _seconds: number;
      _nanoseconds: number;
    };
    refreshToken: string;
  };
  username: string;
} | null> => {
  try {
    const response = await fetch(`${BASE_URL}/api/user?address=${address}`);
    return response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

const saveTwitterAuth = async (
  address: string,
  twitterAuth: {
    accessToken: string;
    expiresAt: number;
    refreshToken: string;
    username: string;
    imageUrl: string;
  }
) => {
  try {
    const response = await fetch(`${BASE_URL}/api/twitter`, {
      method: "POST",
      body: JSON.stringify({
        username: twitterAuth.username,
        walletAddress: address!,
        accessToken: twitterAuth.accessToken,
        refreshToken: twitterAuth.refreshToken,
        expiresIn: twitterAuth.expiresAt,
        imageUrl: twitterAuth.imageUrl ?? "",
      }),
    });
    return response.json();
  } catch (error) {
    console.error("Error saving twitter auth:", error);
    return null;
  }
};

export function AgentSettings({
  agent,
  settings,
  account,
}: AgentSettingsProps) {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const [formData, setFormData] = useState(settings);
  const { data: session } = useSession();
  const { address } = useAccount();
  const addressLowerCase = useMemo(() => address?.toLowerCase(), [address]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (agent.creatorAddress && address) {
      if (Array.isArray(agent.creatorAddress)) {
        const isOwner = agent.creatorAddress.some((addr) => {
          if (typeof addr === "string") {
            return address?.toLowerCase() === addr.toLowerCase();
          }
          return false;
        });
        if (!isOwner) {
          router.push(`/agent/${agent.name}`);
        }
      } else {
        const creatorAddressString = String(agent.creatorAddress);
        const isOwner =
          address?.toLowerCase() === creatorAddressString.toLowerCase();
        if (!isOwner) {
          router.push(`/agent/${agent.name}`);
        }
      }
      setIsOwner(isOwner);
    }
  }, [address, agent, router]);

  const { data: user } = useQuery({
    queryKey: ["user", addressLowerCase],
    queryFn: () => getUser(addressLowerCase || ""),
    enabled: !!addressLowerCase,
  });

  useEffect(() => {
    if (
      user?.twitterAuth?.expiresAt?._seconds &&
      user.twitterAuth.expiresAt._seconds * 1000 >
        Date.now() + 4 * 3600 * 1000 &&
      session?.expires &&
      new Date(session.expires).getTime() > Date.now() + 4 * 3600 * 1000
    ) {
      const cleanSession = () => {
        sessionStorage.clear();
        signOut({ redirect: false });
      };

      cleanSession();
    }
  }, [user, session]);

  const twitterAuth = useCallback(async () => {
    if (address && user?.twitterAuth && account) {
      const twitterAuth = {
        accessToken: account.accessToken,
        refreshToken: account.refreshToken,
        expiresAt: account.expiresIn,
        username: account.username,
        imageUrl: session?.user?.image ?? "",
      };

      const response = await saveTwitterAuth(address, twitterAuth);
    }
  }, [address, user, account, session]);

  useEffect(() => {
    if (account && address) {
      console.log("twitterAuth update");
      twitterAuth();
    }
  }, [twitterAuth, account, address]);

  const actionsWithIcons = settings.actions.map((action) => {
    switch (action) {
      case "post":
        return {
          name: action,
          icon: NotebookPen,
        };
      case "reply":
        return {
          name: action,
          icon: MessageSquare,
        };
      case "retweet":
        return {
          name: action,
          icon: Repeat,
        };
      case "like":
        return {
          name: action,
          icon: Heart,
        };
      default:
        return {
          name: action,
          icon: Play,
        };
    }
  });

  const providersWithIcons = settings.providers.map((provider) => {
    switch (provider) {
      case "twitter":
        return {
          name: provider,
          icon: FaXTwitter,
        };
      case "farcaster":
        return {
          name: provider,
          icon: FarcasterIcon,
        };
      case "telegram":
        return {
          name: provider,
          icon: (props: any) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              {...props}
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.818-.545 2.792-.771 3.705-.309 1.233-.618 2.327-.927 3.36-.309 1.035-.618 1.891-.927 2.566-.127.306-.255.445-.382.519-.128.074-.319.11-.574.11l-1.891-.11c-.51-.036-.956-.283-1.338-.739-.382-.456-1.165-1.337-2.348-2.64a50.995 50.995 0 01-1.018-1.108c-.128-.183-.264-.264-.41-.245-.255.036-.382.264-.382.683v2.603c0 .452-.091.79-.272 1.016-.182.226-.4.38-.655.465a6.811 6.811 0 01-2.02.3c-.946 0-1.83-.182-2.657-.547-.818-.365-1.526-.845-2.13-1.442-.6-.602-1.143-1.277-1.636-2.022a44.583 44.583 0 01-1.338-2.13 1.4 1.4 0 01-.163-.438c0-.11.018-.2.054-.272.037-.073.11-.11.218-.11h3.487c.219 0 .383.037.492.11.11.073.219.219.328.437.364.818.782 1.58 1.255 2.293.473.71.818 1.197 1.037 1.46.219.264.346.419.382.464.146.22.31.327.492.328.109 0 .219-.036.328-.11.109-.072.2-.181.273-.327.073-.145.164-.363.273-.655.11-.291.164-.726.164-1.306v-2.13c0-.437-.036-.764-.109-.982-.073-.219-.2-.437-.382-.655-.182-.219-.346-.364-.491-.437-.146-.073-.228-.128-.246-.164-.037-.073-.018-.127.054-.163.073-.037.2-.073.383-.11.583-.035 1.037-.053 1.364-.053.328 0 .783.018 1.365.053.582.036 1.082.054 1.501.054.437 0 .818.018 1.146.054.328.037.564.073.71.11.145.035.254.09.327.163.073.073.127.182.164.328.036.145.054.345.054.6v.054c-.037.364-.055.799-.055 1.31v.763c0 .363.018.655.055.872.036.218.072.382.109.491.036.11.109.218.218.328.109.109.218.163.328.163.218 0 .454-.109.709-.327.254-.22.527-.49.818-.82.291-.327.601-.734.927-1.223.328-.491.601-.982.819-1.474.11-.218.2-.364.273-.436.072-.073.181-.11.327-.11h3.432c.327 0 .564.018.709.055.145.036.218.109.218.218 0 .037-.18.11-.054.218z" />
            </svg>
          ),
        };
      default:
        return {
          name: provider,
          icon: Play,
        };
    }
  });

  const steps = [
    {
      title: "General",
      component: (
        <div>
          <h2 className="text-xl text-gray-300 font-bold mb-4">General</h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-gray-300" />
                  <span className="text-sm text-gray-300 font-bold">
                    Agent Status
                  </span>
                </div>
                {agent.status && (
                  <span
                    className={cn(
                      "text-sm font-bold px-4",
                      agent.status === "active"
                        ? "text-emerald-500"
                        : "text-red-500"
                    )}
                  >
                    {agent.status.charAt(0).toUpperCase() +
                      agent.status.slice(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5 text-gray-300" />
                  <span className="text-sm text-gray-300 font-bold">
                    Refresh Memory
                  </span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger className="text-sm border border-red-300 text-red-300 hover:text-red-500 hover:bg-gradient-to-r hover:from-red-500/25 hover:to-red-600/25 backdrop-blur-md   rounded-full p-2 transition-colors duration-200">
                    Refresh
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          fetch(`/api/agents`, {
                            method: "DELETE",
                            body: JSON.stringify({ agentId: agent.agentId }),
                          });
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm text-gray-300 font-bold mb-0.5">
                Connect to your social accounts to start posting
              </h3>
              <div className="flex flex-col gap-2">
                {providersWithIcons.map((provider) => (
                  <div
                    key={provider.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <provider.icon className="w-5 h-5 text-gray-300" />
                      <span className="text-sm font-medium text-gray-300">
                        {provider.name.charAt(0).toUpperCase() +
                          provider.name.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {provider.name === "twitter" &&
                      session?.user?.name &&
                      session?.user?.image ? (
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#000] to-[rgba(217,217,217,0.10)] hover-gradient rounded-full gap-4 w-full">
                          <Image
                            src={session.user.image}
                            alt="User Avatar"
                            className="w-10 h-10 rounded-full"
                            width={40}
                            height={40}
                          />
                          <div>
                            <p className="text-white font-semibold">
                              {session.user.name}
                            </p>
                          </div>

                          <button
                            onClick={() => signOut()}
                            className="text-sm text-red-500 hover:text-red-700 ml-auto hover:bg-red-500/10 rounded-full p-2 transition-colors duration-200"
                          >
                            <LogOut className="w-5 h-5" />
                          </button>
                        </div>
                      ) : provider.name === "telegram" ? (
                        <button
                          onClick={() =>
                            router.push(`/agent/${agent.name}/telegram`)
                          }
                          className="text-white flex items-center justify-start p-3 bg-gradient-to-r hover-gradient from-[#0088CC] to-[rgba(0,136,204,0.7)] transition-colors rounded-full gap-2 w-full"
                        >
                          Configure
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="text-white flex items-center justify-start p-3 bg-gradient-to-r hover-gradient from-[#000] to-[rgba(217,217,217,0.10)] transition-colors rounded-full gap-2 w-full"
                          >
                            Connect
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
      icon: Plug,
    },
    {
      title: "Actions",
      component: (
        <div>
          <h2 className="text-xl text-gray-300 font-bold mb-4">Actions</h2>
          <div className="flex flex-col gap-2">
            {actionsWithIcons.map((action) => (
              <div
                key={action.name}
                className="flex items-center justify-between w-1/3"
              >
                <div className="flex items-center gap-2">
                  <action.icon className="w-5 h-5 text-gray-300" />
                  <span className="text-sm font-medium text-gray-300">
                    {action.name.charAt(0).toUpperCase() + action.name.slice(1)}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.actions.includes(action.name)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        actions: e.target.checked
                          ? [...formData.actions, action.name]
                          : formData.actions.filter((a) => a !== action.name),
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      ),
      icon: Play,
    },
  ];
  return (
    <div className="mx-auto">
      <div className="glassmorphism rounded-xl">
        <div className="flex">
          <div className="w-64 border-r border-gray-700">
            <div className="p-4">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors mb-2 ${
                    step === i
                      ? "bg-blue-500/20 text-blue-400"
                      : "hover:bg-gray-700/50 text-gray-300"
                  }`}
                >
                  <s.icon className="w-5 h-5" />
                  <span className="font-medium">{s.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[calc(100vh-16rem)]">
            <div className="flex-1 p-6 overflow-y-auto">
              {steps[step].component}
            </div>

            <div className="p-4 border-t border-gray-700 flex items-center justify-between">
              <button
                onClick={() => router.push(`/agent/${agent.id}`)}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-700/50 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle save configuration
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
