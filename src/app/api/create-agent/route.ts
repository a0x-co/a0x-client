import { NextRequest, NextResponse } from "next/server";

const A0X_AGENT_API_KEY = process.env.A0X_AGENT_API_KEY;
const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

export async function POST(request: NextRequest) {
  const { agentName, creatorAddress } = await request.json();

  try {
    const addressLowerCase = creatorAddress.toLowerCase();

    const response = await fetch(
      `${A0X_AGENT_API_URL}/a0x-framework/deploy-a0x-agent`,
      {
        method: "POST",
        headers: {
          "x-api-key": A0X_AGENT_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentName: agentName,
          creatorAddress: addressLowerCase,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating empty agent:", error);
    return NextResponse.json(
      { error: "Failed to create empty agent" },
      { status: 500 }
    );
  }
}
