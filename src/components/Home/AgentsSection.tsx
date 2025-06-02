// react

// http request
import axios from "axios";

// types
import { Agent, Order, Pool, SortOption, PoolWithAgent } from "@/types";

// components
import { AgentCard } from "../AgentCard";

// react query
import { useQuery } from "@tanstack/react-query";

import { DotsAnimation } from "../Icons/DotsAnimation";

// Importar las utilidades para manejar timestamps de Firestore
import { firestoreTimestampToDate } from "@/utils/firestore-timestamp";

// Importar useState para manejar el estado del filtro y la paginación
import { useEffect, useState } from "react";
import FarcasterIcon from "../Icons/FarcasterIcon";
import { FaVault, FaXTwitter } from "react-icons/fa6";
import {
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  Copy,
  SortDesc,
  ChartLine,
  CircleDollarSign,
} from "lucide-react"; // Importar iconos para la paginación y adicionales para la vista de tabla
import Image from "next/image";

// Importar componentes de UI para tabs
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";

// Importar el componente PoolsTable
import PoolsTable from "../PoolsTable";

const getAgents = async (): Promise<Agent[]> => {
  try {
    const response = await axios.get("/api/agents");
    return response.data;
  } catch (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
};

const getPools = async (
  sort: SortOption,
  order: Order
): Promise<{ pools: PoolWithAgent[]; total: number }> => {
  const params = new URLSearchParams({
    sort,
    order,
  });
  try {
    const response = await axios.get(`/api/pools?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pools:", error);
    return { pools: [], total: 0 };
  }
};

export const AgentsSection = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["agents"],
    queryFn: getAgents,
  });

  const {
    data: dataPoolsWithAgentsSortedByVolume,
    isLoading: isLoadingPoolsSortedByVolume,
    error: errorPoolsSortedByVolume,
    refetch: refetchPoolsSortedByVolume,
  } = useQuery({
    queryKey: ["pools", "topVolume"],
    queryFn: () => getPools(SortOption.VOLUME_6H, Order.DESC),
  });

  const {
    data: dataPoolsWithAgentsSortedByMarketCap,
    isLoading: isLoadingPoolsSortedByMarketCap,
    error: errorPoolsSortedByMarketCap,
    refetch: refetchPoolsSortedByMarketCap,
  } = useQuery({
    queryKey: ["pools", "topMarketCap"],
    queryFn: () => getPools(SortOption.MARKET_CAP, Order.DESC),
  });

  const {
    data: dataPoolsWithAgentsSortedByCreatedAt,
    isLoading: isLoadingPoolsSortedByCreatedAt,
    error: errorPoolsSortedByCreatedAt,
    refetch: refetchPoolsSortedByCreatedAt,
  } = useQuery({
    queryKey: ["pools", "createdAt"],
    queryFn: () => getPools(SortOption.CREATED_AT, Order.DESC),
  });

  const {
    data: dataPoolsWithAgentsSortedByLiquidity,
    isLoading: isLoadingPoolsSortedByLiquidity,
    error: errorPoolsSortedByLiquidity,
    refetch: refetchPoolsSortedByLiquidity,
  } = useQuery({
    queryKey: ["pools", "topLiquidity"],
    queryFn: () => getPools(SortOption.LIQUIDITY, Order.DESC),
  });

  const isLoadingPools =
    isLoadingPoolsSortedByVolume ||
    isLoadingPoolsSortedByMarketCap ||
    isLoadingPoolsSortedByCreatedAt ||
    isLoadingPoolsSortedByLiquidity;

  const [activeFilter, setActiveFilter] = useState<
    "all" | "farcaster" | "token" | "twitter"
  >("all");

  // Añadir estado para el modo avanzado
  const [advancedView, setAdvancedView] = useState(false);

  // Estado para el tab activo en la vista avanzada
  const [activeTab, setActiveTab] = useState("latest");

  // Estados para la paginación de cada pestaña
  const [currentPage, setCurrentPage] = useState(1);
  const [latestTokensPage, setLatestTokensPage] = useState(1);
  const [marketCapPage, setMarketCapPage] = useState(1);
  const [liquidityPage, setLiquidityPage] = useState(1);
  const [trendingPage, setTrendingPage] = useState(1);
  const itemsPerPage = 20;

  const parseDate = (dateValue: any): Date => {
    if (!dateValue) return new Date(0);

    if (
      dateValue._seconds !== undefined &&
      dateValue._nanoseconds !== undefined
    ) {
      return firestoreTimestampToDate(dateValue);
    }

    if (typeof dateValue === "string") {
      return new Date(dateValue);
    }

    if (dateValue instanceof Date) {
      return dateValue;
    }

    return new Date(0);
  };

  const sortAgents = (agents: Agent[]) => {
    return [...agents].sort((a, b) => {
      if (a.token?.address && !b.token?.address) return -1;
      if (!a.token?.address && b.token?.address) return 1;

      if (a.farcasterClient && !b.farcasterClient) return -1;
      if (!a.farcasterClient && b.farcasterClient) return 1;

      const aHasConnected = a.connectedWith && a.connectedWith.length > 0;
      const bHasConnected = b.connectedWith && b.connectedWith.length > 0;
      if (aHasConnected && !bHasConnected) return -1;
      if (!aHasConnected && bHasConnected) return 1;

      const aDate = parseDate(a.deployedAt);
      const bDate = parseDate(b.deployedAt);
      return bDate.getTime() - aDate.getTime();
    });
  };

  const removeDuplicates = (agents: Agent[]): Agent[] => {
    const uniqueIds = new Set<string>();
    return agents.filter((agent) => {
      const uniqueId = agent.agentId || agent.id || agent.name;

      if (uniqueIds.has(uniqueId)) {
        return false;
      }

      uniqueIds.add(uniqueId);
      return true;
    });
  };

  const filterAgents = (agents: Agent[]) => {
    const uniqueAgents = removeDuplicates(agents);

    if (activeFilter === "all") return uniqueAgents;

    return uniqueAgents.filter((agent) => {
      if (activeFilter === "token" && agent?.token?.address) return true;
      if (
        activeFilter === "farcaster" &&
        agent?.farcasterClient &&
        agent?.farcasterClient.status == "approved"
      )
        return true;
      if (
        activeFilter === "twitter" &&
        ((agent?.connectedWith &&
          agent.connectedWith.some((conn) => conn?.app === "X")) ||
          !!agent?.twitterConnected ||
          !!agent?.twitterAccount)
      )
        return true;

      return false;
    });
  };

  // Función para obtener los últimos agentes creados
  const getLatestAgents = (agents: Agent[]): Agent[] => {
    return [...agents]
      .sort((a, b) => {
        const aDate = parseDate(a.createdAt);
        const bDate = parseDate(b.createdAt);
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 4);
  };

  // Función para formatear valores numéricos
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}m`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}k`;
    }
    return `$${num.toFixed(2)}`;
  };

  // Función para formatear porcentajes
  const formatPercentage = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span className={`${isPositive ? "text-green-500" : "text-red-500"}`}>
        {isPositive ? "+" : ""}
        {value.toFixed(2)}%
      </span>
    );
  };

  // Función para cambiar de página en la vista normal
  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Función para cambiar de página en la pestaña "Latest Tokens"
  const changeLatestTokensPage = (page: number) => {
    if (page < 1 || page > latestTokensTotalPages) return;
    setLatestTokensPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Función para cambiar de página en la pestaña "Trending"
  const changeTrendingPage = (page: number) => {
    if (page < 1 || page > trendingTotalPages) return;
    setTrendingPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sortedAgents = data ? sortAgents(data) : [];
  const filteredAgents = filterAgents(sortedAgents);

  // Obtener los agentes para las secciones especiales
  const latestAgents = getLatestAgents(sortedAgents);

  // Obtener todos los agentes con token para la pestaña "Latest Tokens"
  const allTokenAgents = dataPoolsWithAgentsSortedByCreatedAt?.pools.filter(
    (pool) => pool.agent
  );

  // Obtener todos los agentes ordenados por engagement para la pestaña "Trending"
  const allTrendingAgents = dataPoolsWithAgentsSortedByVolume?.pools.filter(
    (pool) => pool.agent
  );

  const allMarketCapAgents = dataPoolsWithAgentsSortedByMarketCap?.pools.filter(
    (pool) => pool.agent
  );

  const allLiquidityAgents = dataPoolsWithAgentsSortedByLiquidity?.pools.filter(
    (pool) => pool.agent
  );

  // Calcular el total de páginas para cada vista
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const latestTokensTotalPages = allTokenAgents
    ? Math.ceil(allTokenAgents.length / itemsPerPage)
    : 0;
  const trendingTotalPages = allTrendingAgents
    ? Math.ceil(allTrendingAgents.length / itemsPerPage)
    : 0;
  const marketCapTotalPages = allMarketCapAgents
    ? Math.ceil(allMarketCapAgents.length / itemsPerPage)
    : 0;
  const liquidityTotalPages = allLiquidityAgents
    ? Math.ceil(allLiquidityAgents.length / itemsPerPage)
    : 0;

  // Paginar los agentes para cada vista
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedTokenAgents = allTokenAgents
    ? allTokenAgents.slice(
        (latestTokensPage - 1) * itemsPerPage,
        latestTokensPage * itemsPerPage
      )
    : [];

  const paginatedMarketCapAgents = allMarketCapAgents
    ? allMarketCapAgents.slice(
        (marketCapPage - 1) * itemsPerPage,
        marketCapPage * itemsPerPage
      )
    : [];

  const paginatedLiquidityAgents = allLiquidityAgents
    ? allLiquidityAgents.slice(
        (liquidityPage - 1) * itemsPerPage,
        liquidityPage * itemsPerPage
      )
    : [];

  const paginatedTrendingAgents = allTrendingAgents
    ? allTrendingAgents.slice(
        (trendingPage - 1) * itemsPerPage,
        trendingPage * itemsPerPage
      )
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32 text-black/60">
        Loading agents <DotsAnimation />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Botones de filtrado con switch de vista avanzada */}
      <div className="flex justify-center mb-6 gap-2 items-center">
        <button
          onClick={() => {
            setActiveFilter("all");
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeFilter === "all"
              ? "bg-white text-black shadow-md"
              : "bg-white/10 text-black/80 hover:bg-black/20"
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setActiveFilter("token");
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center ${
            activeFilter === "token"
              ? "bg-yellow-500 text-white shadow-md"
              : "bg-yellow-500/25 text-yellow-600 hover:bg-yellow-500/40"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
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
          Token
        </button>
        <button
          onClick={() => {
            setActiveFilter("farcaster");
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center ${
            activeFilter === "farcaster"
              ? "bg-purple-500 text-white shadow-md"
              : "bg-purple-500/10 text-purple-500/80 hover:bg-purple-500/20"
          }`}
        >
          <FarcasterIcon className="h-4 w-4 mr-1" />
          Farcaster
        </button>
        <button
          onClick={() => {
            setActiveFilter("twitter");
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center ${
            activeFilter === "twitter"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-blue-500/10 text-blue-500/80 hover:bg-blue-500/20"
          }`}
        >
          <FaXTwitter size={16} className="mr-1" />
          Twitter
        </button>

        {/* Switch para vista avanzada */}
        <div className="ml-4 flex items-center">
          <span className="text-sm text-black/70 mr-2">Advanced view</span>
          <button
            onClick={() => setAdvancedView(!advancedView)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              advancedView ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                advancedView ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Vista avanzada con tabs */}
      {advancedView ? (
        <div className="space-y-8 mb-4">
          <div className="rounded-[24px] border border-white/5">
            <Tabs
              defaultValue="latest"
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-4 bg-white/10 p-1 rounded-full flex gap-2">
                <TabsTrigger
                  value="latest"
                  className="rounded-full border data-[state=inactive]:border-purple-50 data-[state=active]:text-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-50 data-[state=active]:to-white flex items-center gap-2"
                >
                  <SortDesc size={16} />
                  Latest Tokens
                </TabsTrigger>
                <TabsTrigger
                  value="trending"
                  className="rounded-full border data-[state=inactive]:border-blue-50 data-[state=active]:text-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-white flex items-center gap-2"
                >
                  <ChartLine size={16} />
                  Trending
                </TabsTrigger>
                <TabsTrigger
                  value="marketCap"
                  className="rounded-full border data-[state=inactive]:border-indigo-50 data-[state=active]:text-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-50 data-[state=active]:to-white flex items-center gap-2"
                >
                  <CircleDollarSign size={16} />
                  Market Cap
                </TabsTrigger>
                {/* <TabsTrigger
                  value="liquidity"
                  className="rounded-full border data-[state=inactive]:border-red-50 data-[state=active]:text-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-50 data-[state=active]:to-white flex items-center gap-2"
                >
                  <FaVault size={16} />
                  Liquidity
                </TabsTrigger> */}
              </TabsList>

              <TabsContent
                value="latest"
                className="bg-purple-500/10 p-4 rounded-xl"
              >
                <PoolsTable
                  pools={paginatedTokenAgents}
                  currentPage={latestTokensPage}
                  totalPages={latestTokensTotalPages}
                  onPageChange={changeLatestTokensPage}
                  emptyMessage="No latest tokens available"
                  gradientColorClass="bg-gradient-to-r from-purple-50/50 via-white to-white"
                  tickerColorClass="bg-purple-500/25"
                />
              </TabsContent>

              <TabsContent
                value="trending"
                className="bg-blue-500/10 p-4 rounded-xl"
              >
                <PoolsTable
                  pools={paginatedTrendingAgents}
                  currentPage={trendingPage}
                  totalPages={trendingTotalPages}
                  onPageChange={changeTrendingPage}
                  emptyMessage="No trending agents available"
                  gradientColorClass="bg-gradient-to-r from-blue-50/50 via-white to-white"
                  tickerColorClass="bg-blue-500/25"
                />
              </TabsContent>

              <TabsContent
                value="marketCap"
                className="bg-indigo-500/10 p-4 rounded-xl"
              >
                <PoolsTable
                  pools={paginatedMarketCapAgents}
                  currentPage={marketCapPage}
                  totalPages={marketCapTotalPages}
                  onPageChange={(page) => {
                    if (page < 1 || page > marketCapTotalPages) return;
                    setMarketCapPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  emptyMessage="No market cap data available"
                  gradientColorClass="bg-gradient-to-r from-indigo-50/50 via-white to-white"
                  tickerColorClass="bg-indigo-500/25"
                />
              </TabsContent>

              <TabsContent
                value="liquidity"
                className="bg-red-500/10 p-4 rounded-xl"
              >
                <PoolsTable
                  pools={paginatedLiquidityAgents}
                  currentPage={liquidityPage}
                  totalPages={liquidityTotalPages}
                  onPageChange={(page) => {
                    if (page < 1 || page > liquidityTotalPages) return;
                    setLiquidityPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  emptyMessage="No liquidity data available"
                  gradientColorClass="bg-gradient-to-r from-red-50/50 to-white"
                  tickerColorClass="bg-red-500/25"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        // Vista normal con sección de últimos agentes creados
        <div className="space-y-8">
          {/* Sección de últimos agentes creados */}
          <div className="rounded-[24px] border border-white/5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4">
            <h2 className="text-xl font-bold mb-4 text-black">
              Latest agents created
            </h2>
            {latestAgents.length === 0 ? (
              <div className="py-4 text-center text-black/60">
                No agents available
              </div>
            ) : (
              <div className="relative space-y-[1px]">
                {latestAgents.map((agent: Agent) => {
                  const uniqueKey =
                    agent.agentId ||
                    agent.id ||
                    `agent-${agent.name}-${Math.random()
                      .toString(36)
                      .substr(2, 9)}`;

                  return (
                    <div
                      key={uniqueKey}
                      className="group relative rounded-xl transition-all duration-300 transform hover:scale-[1.01]"
                    >
                      <AgentCard
                        agent={agent}
                        isCreating={false}
                        className="w-full border-none shadow-none"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lista completa de agentes filtrados */}
          <div className="relative rounded-[24px] border border-white/5 bg-black/10 p-4">
            <h2 className="text-xl font-bold mb-4 text-black">All agents</h2>
            {paginatedAgents.length === 0 ? (
              <div className="py-8 text-center text-black/60">
                No agents found with the selected filter
              </div>
            ) : (
              <div className="relative space-y-[1px]">
                {paginatedAgents.map((agent: Agent) => {
                  const uniqueKey =
                    agent.agentId ||
                    agent.id ||
                    `agent-${agent.name}-${Math.random()
                      .toString(36)
                      .substr(2, 9)}`;

                  return (
                    <div
                      key={uniqueKey}
                      className="group relative rounded-xl transition-all duration-500 ease-in-out transform hover:scale-[1.01]"
                    >
                      <AgentCard
                        agent={agent}
                        isCreating={false}
                        className="w-full border-none shadow-none"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paginación para la vista normal */}
      {!advancedView && totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-2">
          <button
            onClick={() => changePage(currentPage - 1)}
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
                onClick={() => changePage(1)}
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
                onClick={() => changePage(currentPage - 1)}
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
                onClick={() => changePage(currentPage + 1)}
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
                onClick={() => changePage(totalPages)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-white/10 text-gray-700"
              >
                {totalPages}
              </button>
            )}
          </div>

          <button
            onClick={() => changePage(currentPage + 1)}
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
