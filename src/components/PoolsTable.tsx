import React from "react";
import Image from "next/image";
import { Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { PoolWithAgent } from "@/types";
import FarcasterIcon from "./Icons/FarcasterIcon";
import { FaXTwitter } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PoolsTableProps {
  pools: PoolWithAgent[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  emptyMessage?: string;
  gradientColorClass?: string;
  tickerColorClass?: string;
}

// Función para formatear valores numéricos
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}m`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}k`;
  }
  return `$${num.toFixed(2)}`;
};

const PoolsTable: React.FC<PoolsTableProps> = ({
  pools,
  currentPage,
  totalPages,
  onPageChange,
  emptyMessage = "No agents available",
  gradientColorClass = "bg-gradient-to-r from-purple-50 to-white",
  tickerColorClass = "bg-purple-500/50",
}) => {
  return (
    <div>
      <table className="w-full text-sm border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th className="text-left py-3 px-4 font-medium text-black/70">
              AI Agents
            </th>
            <th className="text-right py-3 px-4 font-medium text-black/70">
              TVL
            </th>
            <th className="text-right py-3 px-4 font-medium text-black/70">
              Market Cap
            </th>
            <th className="text-right py-3 px-4 font-medium text-black/70">
              6h Vol
            </th>
            <th className="text-right py-3 px-4 font-medium text-black/70">
              6h Chg
            </th>
          </tr>
        </thead>
        <tbody>
          {pools.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-black/60">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            pools.map((pool: PoolWithAgent) => {
              const uniqueKey =
                pool.agent.agentId ||
                pool.agent.id ||
                `agent-${pool.agent.name}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`;

              // Valores para la tabla
              const tvl = pool.marketData.liquidity.totalLiquidityUSDC;
              const marketCap = pool.marketData.marketCap;
              const change6h = pool.marketData.priceChanges["6h"];
              const volume6h = pool.marketData.volume["6h"].volumeInUsdc;

              return (
                <tr
                  key={uniqueKey}
                  className="transition-all duration-300 hover:scale-[1.01]"
                >
                  <td
                    className={`py-4 px-4 rounded-l-xl shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)] ${gradientColorClass}`}
                  >
                    <Link
                      href={`/agent/${pool.agent.name}?tokenView=1`}
                      className="block"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-50 ring-offset-2 ring-offset-white group-hover:ring-blue-100">
                          <Image
                            src={
                              pool.agent?.imageUrl ||
                              pool.agent?.connectedWith
                                ?.find((conn) => conn.app === "X")
                                ?.imageUrl?.replace("normal", "400x400") ||
                              pool.agent?.farcasterClient?.pfp_url ||
                              "https://storage.googleapis.com/a0x-mirror-storage/agent-empty.png"
                            }
                            alt={pool.agent.name}
                            className="w-full h-full object-cover"
                            width={40}
                            height={40}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-lg text-gray-800">
                            {pool.agent.name}
                          </div>
                          <div className="text-xs text-black/60 flex items-center gap-1">
                            {pool.token0Data?.symbol && (
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 rounded-md text-black",
                                  tickerColorClass
                                )}
                              >
                                {pool.token0Data.symbol.startsWith("$")
                                  ? pool.token0Data.symbol
                                  : "$" + pool.token0Data.symbol}
                              </span>
                            )}
                            {pool.token0Data?.address && (
                              <div className="flex items-center">
                                <span className="text-xs truncate max-w-[80px]">
                                  {pool.token0Data.address.substring(0, 6)}
                                  ...
                                  {pool.token0Data.address.substring(
                                    pool.token0Data.address.length - 4
                                  )}
                                </span>
                                <button
                                  className="ml-1 text-black/40 hover:text-black/70"
                                  onClick={(e) => {
                                    e.preventDefault(); // Previene la navegación del Link
                                    e.stopPropagation(); // Detiene la propagación del evento
                                    // Lógica para copiar la dirección
                                    navigator.clipboard.writeText(
                                      pool.token0Data.address
                                    );
                                  }}
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            )}
                            {pool.agent.farcasterAccount && (
                              <span className="text-purple-500 flex items-center">
                                <FarcasterIcon className="h-3 w-3 mr-0.5" />
                                {pool.agent.farcasterAccount}
                              </span>
                            )}
                            {pool.agent.twitterAccount &&
                              !pool.agent.farcasterAccount && (
                                <span className="text-blue-500 flex items-center">
                                  <FaXTwitter size={12} className="mr-0.5" />
                                  {pool.agent.twitterAccount}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td
                    className={`py-4 px-4 text-right font-medium shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)] ${gradientColorClass}`}
                  >
                    {formatNumber(tvl)}
                  </td>
                  <td
                    className={`py-4 px-4 text-right font-medium shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)] ${gradientColorClass}`}
                  >
                    {formatNumber(marketCap)}
                  </td>
                  <td
                    className={`py-4 px-4  text-right shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)] ${gradientColorClass}`}
                  >
                    {formatNumber(volume6h)}
                  </td>
                  <td
                    className={`py-4 px-4 rounded-r-xl text-right shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)] ${gradientColorClass}`}
                  >
                    {change6h !== null ? (
                      <span
                        className={
                          change6h >= 0 ? "text-green-500" : "text-red-500"
                        }
                      >
                        {change6h >= 0 ? "+" : ""}
                        {change6h?.toFixed(2)}%
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-full ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-black hover:bg-white/10"
            }`}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-1">
            {/* Primera página */}
            {currentPage > 2 && (
              <button
                onClick={() => onPageChange(1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-white/10 text-gray-700"
              >
                1
              </button>
            )}

            {currentPage > 3 && (
              <span className="w-8 h-8 flex items-center justify-center text-gray-700">
                ...
              </span>
            )}

            {currentPage > 1 && (
              <button
                onClick={() => onPageChange(currentPage - 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-white/10 text-gray-700"
              >
                {currentPage - 1}
              </button>
            )}

            <button className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-white text-black font-medium">
              {currentPage}
            </button>

            {currentPage < totalPages && (
              <button
                onClick={() => onPageChange(currentPage + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-white/10 text-gray-700"
              >
                {currentPage + 1}
              </button>
            )}

            {currentPage < totalPages - 2 && (
              <span className="w-8 h-8 flex items-center justify-center text-gray-700">
                ...
              </span>
            )}

            {currentPage < totalPages - 1 && (
              <button
                onClick={() => onPageChange(totalPages)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-white/10 text-gray-700"
              >
                {totalPages}
              </button>
            )}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-full ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-black hover:bg-white/10"
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PoolsTable;
