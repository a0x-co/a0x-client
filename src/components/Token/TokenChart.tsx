"use client";

// react
import { memo } from "react";

// next
import Image from "next/image";

// hooks
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { AgentFees } from "@/components/AgentDetails/AgentFees";

// icons
import { ExternalLink, Copy } from "lucide-react";
import TokenInfo from "./TokenInfo";

interface ChartProps {
  tokenAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  agentImage?: string;
  poolAddress?: string;
}

const url =
  "https://dexscreener.com/base/tokenAddress?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=15";

const parseTokenAddress = (tokenAddress: string) => {
  return url.replace("tokenAddress", tokenAddress);
};

const TokenChart: React.FC<ChartProps> = ({
  tokenAddress,
  tokenName = "A0x Agent",
  tokenSymbol = "$A0x",
  agentImage = "https://storage.googleapis.com/a0x-mirror-storage/agent-empty.png",
  poolAddress,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(tokenAddress);
  };

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Token Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl gap-4">
        <div className="flex items-center gap-4">
          {/* Token Icon */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
            <Image
              src={agentImage}
              alt={tokenName}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>

          {/* Token Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-mono text-white">{tokenName}</h2>
              <span className="text-sm font-mono text-white/60">
                {tokenSymbol}
              </span>
            </div>

            {/* Token Address */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-white/40">
                {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
              </span>
              <button
                onClick={handleCopyAddress}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <Copy className="w-3 h-3 text-white/40" />
              </button>
              <a
                href={`https://basescan.org/token/${tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <ExternalLink className="w-3 h-3 text-white/40" />
              </a>
            </div>
          </div>
        </div>

        {poolAddress && <AgentFees poolAddress={poolAddress} />}
      </div>

      {/* Chart */}
      <div className="relative w-full aspect-[16/9] h-96 md:max-h-[580px]">
        <iframe
          className="absolute inset-0 w-full h-full"
          id="dexscreener-embed"
          title="Dexscreener Embed"
          src={parseTokenAddress(tokenAddress)}
          allow="clipboard-write"
          allowFullScreen
        ></iframe>
      </div>

      {/* Token Info */}
      {/* <div className="relative w-full aspect-[16/9] max-h-[580px]">
        <TokenInfo tokenAddress={tokenAddress} />
      </div> */}
    </div>
  );
};

export default memo(TokenChart);
