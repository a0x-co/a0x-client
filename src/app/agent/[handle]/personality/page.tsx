"use client";

// components
import { AgentPersonality } from "@/components/AgentDetails/AgentPersonality";

// types
import {
  Agent,
  AgentPersonalityConfig,
  AgentPersonalityElizaFormat,
  AgentPersonality as AgentPersonalityType,
} from "@/types";
import { useQuery } from "@tanstack/react-query";

// icons
import { ArrowLeft } from "lucide-react";

// next
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const getAgent = async (handle: string): Promise<Agent> => {
  try {
    const response = await fetch(`${BASE_URL}/api/agents?name=${handle}`);
    const agent = await response.json();
    // const agent = sampleAgents.find((agent: Agent) => agent.name === handle); // DEVELOPMENT
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

export default function PersonalityPage() {
  const params = useParams();
  console.log("params", params);
  const handle = params.handle as string;
  const { data: agent } = useQuery({
    queryKey: ["agent", handle],
    queryFn: () => {
      if (!handle) {
        return null;
      }
      return getAgent(handle);
    },
    enabled: !!handle,
  });

  const { data: personality } = useQuery({
    queryKey: ["personality", handle],
    queryFn: () => {
      if (!handle) {
        return null;
      }
      return getPersonality(handle);
    },
    enabled: !!handle,
  });

  const [config, setConfig] = useState<AgentPersonalityConfig | null>(null);

  const [originalPersonality, setOriginalPersonality] =
    useState<AgentPersonalityConfig | null>(null);

  useEffect(() => {
    if (personality) {
      const requiredPersonalityFields = {
        bio: personality.bio,
        lore: personality.lore,
        style: {
          all: personality.style.all,
          chat: personality.style.chat,
          post: personality.style.post,
        },
        knowledge: personality.knowledge,
        topics: personality.topics,
        messageExamples: personality.messageExamples,
        postExamples: personality.postExamples,
        adjectives: personality.adjectives,
        system: personality?.system,
      };
      setConfig(requiredPersonalityFields);
      setOriginalPersonality(requiredPersonalityFields);
    }
  }, [personality]);

  console.log(agent);

  return (
    <main className="min-h-screen w-[99vw] overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          {agent && (
            <Link
              href={`/agent/${agent?.name}`}
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
          <h1 className="text-2xl font-medium text-gray-800">
            Personality of {agent?.name}
          </h1>
        </div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8 text-gray-500">
              Loading...
            </div>
          }
        >
          {personality && agent && config && originalPersonality && (
            <AgentPersonality
              agent={agent}
              config={config}
              setConfig={setConfig}
              from="personality-page"
              originalPersonality={originalPersonality}
              setOriginalPersonality={setOriginalPersonality}
            />
          )}
        </Suspense>
      </div>
    </main>
  );
}
