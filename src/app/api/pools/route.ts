import { NextRequest, NextResponse } from "next/server";

import { SortOption, Order } from "@/types";
import axios from "axios";

const API_KEY = process.env.API_KEY;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sortType = searchParams.get("sort");
  const orderType = searchParams.get("order");

  let params;
  switch (sortType) {
    case SortOption.MARKET_CAP:
      switch (orderType) {
        case Order.ASC:
          params = new URLSearchParams({
            sort: SortOption.MARKET_CAP,
            order: Order.ASC,
            limit: "50",
            offset: "0",
          });
          break;
        case Order.DESC:
          params = new URLSearchParams({
            sort: SortOption.MARKET_CAP,
            order: Order.DESC,
            limit: "50",
            offset: "0",
          });
          break;
      }
      break;
    case SortOption.VOLUME_6H:
      switch (orderType) {
        case Order.ASC:
          params = new URLSearchParams({
            sort: SortOption.VOLUME_6H,
            order: Order.ASC,
            limit: "50",
            offset: "0",
          });
          break;
        case Order.DESC:
          params = new URLSearchParams({
            sort: SortOption.VOLUME_6H,
            order: Order.DESC,
            limit: "50",
            offset: "0",
          });
          break;
      }
      break;
    case SortOption.VOLUME_1H:
      switch (orderType) {
        case Order.ASC:
          params = new URLSearchParams({
            sort: SortOption.VOLUME_1H,
            order: Order.ASC,
            limit: "50",
            offset: "0",
          });
          break;
        case Order.DESC:
          params = new URLSearchParams({
            sort: SortOption.VOLUME_1H,
            order: Order.DESC,
            limit: "50",
            offset: "0",
          });
          break;
      }
      break;
    case SortOption.VOLUME_15M:
      switch (orderType) {
        case Order.ASC:
          params = new URLSearchParams({
            sort: SortOption.VOLUME_15M,
            order: Order.ASC,
            limit: "50",
            offset: "0",
          });
          break;
        case Order.DESC:
          params = new URLSearchParams({
            sort: SortOption.VOLUME_15M,
            order: Order.DESC,
            limit: "50",
            offset: "0",
          });
          break;
      }
      break;
    case SortOption.CREATED_AT:
      switch (orderType) {
        case Order.ASC:
          params = new URLSearchParams({
            sort: SortOption.CREATED_AT,
            order: Order.ASC,
            limit: "50",
            offset: "0",
          });
          break;
        case Order.DESC:
          params = new URLSearchParams({
            sort: SortOption.CREATED_AT,
            order: Order.DESC,
            limit: "50",
            offset: "0",
          });
          break;
      }
      break;
    case SortOption.LIQUIDITY:
      switch (orderType) {
        case Order.ASC:
          params = new URLSearchParams({
            sort: SortOption.LIQUIDITY,
            order: Order.ASC,
            limit: "50",
            offset: "0",
          });
          break;
        case Order.DESC:
          params = new URLSearchParams({
            sort: SortOption.LIQUIDITY,
            order: Order.DESC,
            limit: "50",
            offset: "0",
          });
          break;
      }
      break;
  }

  try {
    const response = await axios.get(`${A0X_MIRROR_API_URL}/pools?${params}`, {
      headers: {
        "x-api-key": API_KEY!,
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching pools:", error);
    return NextResponse.json(
      { error: `Failed to fetch pools: ${error}` },
      { status: 500 }
    );
  }
}
