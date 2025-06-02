import { NextRequest, NextResponse } from "next/server";

const CLANKER_API_KEY = process.env.CLANKER_API_KEY;

export async function GET(request: NextRequest) {
  console.log("[GET][api/agent-fees]");

  const { searchParams } = new URL(request.url);

  const poolAddress = searchParams.get("poolAddress");

  if (!poolAddress) {
    return NextResponse.json(
      { error: "Pool address is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://www.clanker.world/api/tokens/estimate-rewards-by-pool-address?poolAddress=${poolAddress}`,
      {
        headers: {
          "x-api-key": CLANKER_API_KEY!,
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch estimated rewards" },
      { status: 500 }
    );
  }
}
