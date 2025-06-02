// React
import { useState } from "react";

// Next
import Image from "next/image";

// Types
import { Agent } from "@/types/agent.model";

// Icons
import { AgentFees } from "@/components/AgentDetails/AgentFees";

import { Copy, ExternalLink } from "lucide-react";

// Components

export function TokenSection({ agent }: { agent: Agent }) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(agent.token?.address || "");
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="p-6 bg-black/20 border border-white/10 rounded-xl">
        <h2 className="text-xl font-semibold text-white mb-4">Token</h2>

        {/* Token Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl gap-4 mb-4">
          <div className="flex items-center gap-4">
            {/* Token Icon */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
              <Image
                src={
                  agent.imageUrl ||
                  "https://storage.googleapis.com/a0x-mirror-storage/agent-empty.png"
                }
                alt={agent.token?.name || agent.name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>

            {/* Token Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-mono text-white">
                  {agent.token?.name || `${agent.name} Token`}
                </h2>
                <span className="text-sm font-mono text-white/60">
                  {agent.token?.symbol || "$TOKEN"}
                </span>
              </div>

              {/* Token Address */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-white/40">
                  {agent.token?.address?.slice(0, 6)}...
                  {agent.token?.address?.slice(-4)}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors group relative"
                  aria-label="Copiar dirección del token"
                >
                  <Copy className="w-3 h-3 text-white/40 group-hover:text-white/60" />
                  {copySuccess && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded">
                      Copied!
                    </span>
                  )}
                </button>

                <a
                  href={`https://basescan.org/token/${agent.token?.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                  aria-label="Ver en BaseScan"
                >
                  <ExternalLink className="w-3 h-3 text-white/40 hover:text-white/60" />
                </a>
              </div>
            </div>
          </div>

          {agent.token?.poolAddress && (
            <div className="flex items-center gap-2">
              <AgentFees poolAddress={agent.token.poolAddress} />

              <button className="p-1 hover:bg-white/10 rounded-md transition-colors">
                <p className="text-sm font-mono text-white/40">Claim rewards</p>
              </button>
            </div>
          )}
        </div>

        {/* Token Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-black/30 border border-white/10 rounded-xl">
            <h3 className="text-sm font-medium text-white/60 mb-1">Clanker</h3>

            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-white">
                Go to Clanker
              </span>

              {agent.token?.poolAddress && (
                <a
                  href={`https://www.clanker.world/clanker/${agent.token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-white/40" />
                </a>
              )}
            </div>
          </div>

          <div className="p-4 bg-black/30 border border-white/10 rounded-xl">
            <h3 className="text-sm font-medium text-white/60 mb-1">
              Pool Address
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-white">
                {agent.token?.poolAddress
                  ? `${agent.token.poolAddress.slice(
                      0,
                      6
                    )}...${agent.token.poolAddress.slice(-4)}`
                  : "Not available"}
              </span>

              {agent.token?.poolAddress && (
                <a
                  href={`https://basescan.org/address/${agent.token.poolAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-white/40" />
                </a>
              )}
            </div>
          </div>

          <div className="p-4 bg-black/30 border border-white/10 rounded-xl">
            <h3 className="text-sm font-medium text-white/60 mb-1">
              Transaction Hash
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-white">
                {agent.token?.txHash
                  ? `${agent.token.txHash.slice(
                      0,
                      6
                    )}...${agent.token.txHash.slice(-4)}`
                  : "Not available"}
              </span>

              {agent.token?.txHash && (
                <a
                  href={`https://basescan.org/tx/${agent.token.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-white/40" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
