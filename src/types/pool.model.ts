import { Agent } from "./agent.model";

export enum SortOption {
  MARKET_CAP = "marketData.marketCap",
  VOLUME_6H = "marketData.volume.6h.volumeInUsdc",
  VOLUME_1H = "marketData.volume.1h.volumeInUsdc",
  VOLUME_15M = "marketData.volume.15m.volumeInUsdc",
  CREATED_AT = "createdAt",
  LIQUIDITY = "marketData.liquidity.totalLiquidityUSDC",
  PRICE_CHANGE_6H = "marketData.priceChanges.6h",
  PRICE_CHANGE_1H = "marketData.priceChanges.1h",
  PRICE_CHANGE_15M = "marketData.priceChanges.15m",
}

export enum Order {
  ASC = "asc",
  DESC = "desc",
}

export interface Pool {
  createdAt: string;
  decimals0: number;
  decimals1: number;
  fee: number;
  historyLastUpdated: number;
  marketData: {
    volume: {
      "15m": {
        transactionCount: number;
        volumeInUsdc: number;
      };
      "1h": {
        transactionCount: number;
        volumeInUsdc: number;
      };
      "6h": {
        transactionCount: number;
        volumeInUsdc: number;
      };
    };
    marketCap: number;
    marketCapChanges: {
      "15m": number | null;
      "1h": number | null;
      "6h": number | null;
    };
    liquidity: {
      token0Reserve: string;
      token1Reserve: string;
      token0ReserveFormatted: number;
      token1ReserveFormatted: number;
      token1ValueUSDC: number;
      totalLiquidityUSDC: number;
      token0ValueUSDC: number;
    };
    priceChanges: {
      "15m": number;
      "1h": number;
      "6h": number | null;
    };
  };
  marketHistory: {
    [key: number]: {
      date: string;
      marketCap: number;
      price: number;
      volume: number;
    };
  };
  message: string;
  poolAddress: string;
  poolVersion: string;
  price0to1: number;
  price1to0: number;
  timestamp: number;
  timestampFormatted: string;
  token0: string;
  token0Data: {
    address: string;
    decimals: number;
    name: string;
    priceInToken1: number;
    priceInUSDC: number;
    symbol: string;
    totalSupply: string;
    totalSupplyFormatted: number;
  };
  token1: string;
  token1Data: {
    address: string;
    decimals: number;
    name: string;
    priceInToken1: number;
    priceInUSDC: number;
    symbol: string;
    totalSupply: string;
    totalSupplyFormatted: number;
  };
}

export interface PoolWithAgent extends Pool {
  agent: Agent;
}
