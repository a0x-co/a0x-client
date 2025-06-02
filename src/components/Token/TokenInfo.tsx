"use client";

// react
import { memo } from "react";

// next

// hooks

// icons

interface ChartProps {
  tokenAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  agentImage?: string;
  poolAddress?: string;
}

const url =
  "https://dexscreener.com/base/tokenAddress?embed=1&loadChartSettings=0&trades=0&tabs=0&info=1&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=15";

const parseTokenAddress = (tokenAddress: string) => {
  return url.replace("tokenAddress", tokenAddress);
};

const TokenInfo: React.FC<ChartProps> = ({ tokenAddress }) => {
  return (
    <iframe
      className="absolute inset-0 w-full h-full"
      id="dexscreener-embed"
      title="Dexscreener Embed"
      src={parseTokenAddress(tokenAddress)}
      allow="clipboard-write"
      allowFullScreen
    ></iframe>
  );
};

export default memo(TokenInfo);
