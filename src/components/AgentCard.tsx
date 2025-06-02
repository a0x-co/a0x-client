// next
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";

// lucide
import { Twitter } from "lucide-react";

// types
import type { Agent } from "../types";

// components
import FarcasterIcon from "./Icons/FarcasterIcon";

// utils
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import { FaXTwitter } from "react-icons/fa6";
import { useRouter } from "next/navigation";

interface AgentCardProps {
  agent: Agent;
  isCreating: boolean;
  className?: string;
}

const agentExample = {
  agentId: "8e1863c4-dc40-05c6-882b-e55d41f7d512",
  creatorAddress: "0x9fb5714fc06785a1fcb97b0f4ade8b72dcf70fce",
  createdAt: "28 de febrero de 2025, 11:02:21.223 p.m. UTC-3",
  deletedAt: null,
  deployedAt: "28 de febrero de 2025, 11:02:55.963 p.m. UTC-3",
  elizaVersion: "0.25.6.1",
  endpoint: "https://eliza-exzara-5bz2dcrstq-uc.a.run.app",
  connectedWith: [
    {
      app: "X",
      imageUrl:
        "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
      name: "A N G H E L O",
      username: "A_N_G_H_E_L_O",
    },
  ],
  token: {
    address: "0x006911332baE63F88A14A7Bd4b7CB4b481473957",
    name: "A0XToroZampedri",
    poolAddress: "0x55B4e13cE5a3fDaF24071DDc70C971477d31e7EB",
    symbol: "A0XTZ",
    txHash:
      "0x8e54e912c59ee628808779bd513e542a94a4ef87573ebc06f47a8de63a2331ec",
  },
  farcasterClient: {
    display_name: "A0xZara",
    fid: 900682,
    pfp_url:
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/6d77e1e6-890d-4bbd-dabe-ffbf07434f00/rectcrop3",
    signer_approval_url:
      "https://client.warpcast.com/deeplinks/signed-key-request?token=0x6f84b049e30230f69d30a5a668445621713963431ac0e7e9",
    signer_uuid: "acc936a8-39c0-41b4-bbea-8511109a82f3",
    status: "approved",
    username: "ai420z",
  },
  name: "0xzara",
  status: "active",
  updatedAt: "28 de febrero de 2025, 11:03:00.692 p.m. UTC-3",
};

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isCreating = false,
  className,
}) => {
  const { address } = useAccount();
  const router = useRouter();
  const isOwner = useMemo(() => {
    if (!agent?.creatorAddress) return false;
    if (Array.isArray(agent.creatorAddress)) {
      return agent.creatorAddress.some((addr) => {
        if (typeof addr === "string") {
          return address?.toLowerCase() === addr.toLowerCase();
        }
        return false;
      });
    } else {
      const creatorAddressString = String(agent.creatorAddress);
      return address?.toLowerCase() === creatorAddressString.toLowerCase();
    }
  }, [address, agent]);

  // Verificar qué características tiene el agente con manejo seguro de nulos
  const hasToken = !!agent?.token?.address;
  const hasFarcaster = !!agent?.farcasterClient;
  const hasTwitter =
    (agent?.connectedWith &&
      agent.connectedWith.some((conn) => conn?.app === "X")) ||
    !!agent?.twitterConnected ||
    !!agent?.twitterAccount;

  const handleNavigate = ({
    type,
    handle,
  }: {
    type: "farcaster" | "twitter" | "token";
    handle: string;
  }) => {
    if (type === "farcaster") {
      router.push(`https://warpcast.com/${handle}`);
    }
    if (type === "twitter") {
      router.push(`https://x.com/${handle}`);
    }
    if (type === "token") {
      router.push(`https://a0x.co/agent/${agent.name}?tokenView=true`);
    }
  };

  const navigateIsOwner = isOwner
    ? `/agent/${agent?.name}/dashboard`
    : `/agent/${agent?.name}`;

  return (
    <div
      className={cn(
        "relative overflow-hidden my-2 rounded-[20px]",
        "bg-white border border-gray-100",
        "transition-all duration-300 ease-in-out",
        "p-6 cursor-pointer",
        "transform hover:scale-[1.02]",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)]",
        "hover:shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_8px_20px_rgba(59,130,246,0.1)]",
        "group",
        className
      )}
    >
      <Link href={navigateIsOwner} className="flex items-center gap-4">
        {/* Profile Picture with futuristic border */}
        <div
          className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 
                         ring-2 ring-gray-50 ring-offset-2 ring-offset-white
                         group-hover:ring-blue-100 group-hover:ring-offset-4 
                         transition-all duration-300"
        >
          <Image
            src={
              agent?.connectedWith
                ?.find((conn) => conn.app === "X")
                ?.imageUrl?.replace("normal", "400x400") ||
              agent?.farcasterClient?.pfp_url ||
              "https://storage.googleapis.com/a0x-mirror-storage/agent-empty.png"
            }
            alt={agent.name || "Agent"}
            className="w-full h-full object-contain"
            width={48}
            height={48}
          />
        </div>

        {/* Name and Tag */}
        <div className="flex-1 flex items-center gap-3">
          <div className="flex items-center gap-3">
            <h3
              className="text-lg font-medium text-gray-800 group-hover:text-blue-600 
                            transition-colors duration-300"
            >
              {agent.name}
            </h3>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium
                             bg-gradient-to-r from-blue-50 to-blue-100/50
                             text-blue-600 border border-blue-100/50
                             group-hover:from-blue-100 group-hover:to-blue-50
                             transition-all duration-300"
            >
              {agent.description?.includes("trading")
                ? "Advanced"
                : "AI-powered"}
            </span>
          </div>

          {/* Social Links */}
        </div>
      </Link>
      <div className="flex items-center gap-2 ml-auto pointer-events-auto z-10">
        {(hasToken || hasFarcaster || hasTwitter) && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2 flex gap-2 z-10 pointer-events-auto">
            {hasToken && (
              <Link
                href={`/agent/${agent.name}?tokenView=1`}
                className="bg-gradient-to-r from-gray-50 to-white text-gray-700 border border-gray-100/80 group-hover:text-yellow-600 group-hover:from-yellow-100/50 group-hover:to-white group-hover:border-yellow-100/80 rounded-full px-2 py-1 text-xs font-medium flex items-center group-hover:shadow-[0_0_0_1px_rgba(255,215,0,0.1),0_2px_4px_rgba(255,215,0,0.1)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1 "
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 18V6" />
                </svg>
                <p className="text-xs font-medium text-gray-700">
                  {agent.token?.symbol.startsWith("$")
                    ? agent.token?.symbol
                    : "$" + agent.token?.symbol}
                </p>
              </Link>
            )}
            {hasFarcaster && (
              <Link
                href={`https://warpcast.com/${agent.farcasterClient?.username}`}
                target="_blank"
                className="flex items-center gap-2 text-sm 
                          bg-gradient-to-r from-gray-50 to-white
                          text-gray-700 px-3 py-1.5 rounded-full 
                          transition-all duration-300 border border-gray-100/80
                          group-hover:from-purple-50 group-hover:to-white
                          group-hover:border-purple-100 group-hover:shadow-[0_2px_8px_rgba(147,51,234,0.1)]"
              >
                <FarcasterIcon className="h-3.5 w-3.5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                <p className="text-xs font-medium">
                  {agent.farcasterClient?.username}
                </p>
              </Link>
            )}
            {hasTwitter && (
              <Link
                href={`https://x.com/${
                  agent.connectedWith?.find((conn) => conn.app === "X")
                    ?.username
                }`}
                target="_blank"
                className="flex items-center gap-2 text-sm 
                           bg-gradient-to-r from-gray-50 to-white
                           text-gray-700 px-3 py-1.5 rounded-full 
                           transition-all duration-300 border border-gray-100/80
                           group-hover:from-blue-50 group-hover:to-white
                           group-hover:border-blue-100 group-hover:shadow-[0_2px_8px_rgba(59,130,246,0.1)]"
              >
                <FaXTwitter
                  size={14}
                  className="text-gray-400 group-hover:text-blue-500 transition-colors"
                />
                <p className="text-xs font-medium">
                  {
                    agent.connectedWith?.find((conn) => conn.app === "X")
                      ?.username
                  }
                </p>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
