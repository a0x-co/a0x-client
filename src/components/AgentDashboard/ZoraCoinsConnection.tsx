// react
import { useState } from "react";

// next
import Image from "next/image";

// types
import { Agent } from "@/types";

// shadcn
import { Check } from "lucide-react";

// components
import { Button } from "@/components/shadcn/button";

interface ZoraCoinsConnectionProps {
  agent: Agent;
  refetchAgent: () => void;
}

export function ZoraCoinsConnection({
  agent,
  refetchAgent,
}: ZoraCoinsConnectionProps) {
  const [fallbackIcon, setFallbackIcon] = useState(false);

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
            {!fallbackIcon ? (
              <Image
                src="/assets/logos/zora.png"
                alt="Zora"
                width={20}
                height={20}
                className="h-5 w-5"
                onError={() => setFallbackIcon(true)}
              />
            ) : (
              <span className="text-indigo-600 font-bold text-xs">Z</span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-800">Zora Coins</h3>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center justify-center gap-3">
        <div className="w-full p-3 bg-green-50 rounded-lg mb-2">
          <p className="text-xs text-green-700 text-center">
            <strong>Ready!</strong> {agent.name} is configured to create and
            manage coins on Zora
          </p>
        </div>

        <p className="text-sm text-gray-500 mt-4 font-medium">
          {agent.name} can create and manage its own Zora Coins
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-base font-medium text-gray-800">
                Create Coins
              </span>
            </div>

            <p className="text-sm text-gray-600 pl-7">
              {agent.name} can create its own coins with the Zora protocol
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-base font-medium text-gray-800">
                Manage Coins
              </span>
            </div>

            <p className="text-sm text-gray-600 pl-7">
              Manage your existing coins and their parameters through{" "}
              {agent.name}
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-base font-medium text-gray-800">
                Custom Configuration
              </span>
            </div>

            <p className="text-sm text-gray-600 pl-7">
              Customize the parameters of your coins based on your strategy
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100">
                <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
              </div>
              <span className="text-base font-medium text-gray-800">
                Advanced Analysis
              </span>
            </div>
            <p className="text-sm text-gray-600 pl-7">
              Coming soon - {agent.name} will analyze the performance of your
              coins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
