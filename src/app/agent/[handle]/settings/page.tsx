// components
import { getAccount } from "@/app/api/auth/options";
import { AgentSettings } from "@/components/AgentDetails/AgentSettings";

// types
import { Agent, AgentSettings as AgentSettingsType } from "@/types";

// icons
import { ArrowLeft } from "lucide-react";

// next
import Link from "next/link";
import { Suspense } from "react";

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

const getSettings = async (handle: string): Promise<AgentSettingsType> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/settings-agent?handle=${handle}`
    );
    // const settings = await response.json();
    const settings = {
      actions: ["post", "reply"],
      providers: ["twitter", "telegram"],
    }; // DEVELOPMENT
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const handle = (await params).handle;
  const [agent, settings] = await Promise.all([
    getAgent(handle),
    getSettings(handle),
  ]);

  const account = await getAccount();

  return (
    <main className="min-h-screen w-screen overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/agent/${agent.name}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                     bg-white text-gray-700 transition-all duration-300 
                     border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)]
                     hover:shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_8px_20px_rgba(59,130,246,0.1)]
                     hover:border-blue-100 hover:text-blue-600 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>
        <div className="rounded-[20px] bg-white border border-gray-100
                       shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)] p-6 mb-8">
          <h1 className="text-2xl font-medium text-gray-800">
            Configure {agent.name}
          </h1>
        </div>
        <Suspense fallback={
          <div className="flex items-center justify-center p-8 text-gray-500">
            Loading...
          </div>
        }>
          <AgentSettings agent={agent} settings={settings} account={account} />
        </Suspense>
      </div>
    </main>
  );
}
