import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;
const A0X_MIRROR_API_KEY = process.env.API_KEY;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { active } = await request.json();
    const agentId = id;
    console.log("agentId", agentId, "active", active);

    if (!agentId || active === undefined) {
      return NextResponse.json(
        { error: "Agent ID and active status are required" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${A0X_MIRROR_API_URL}/agents/activate`,
      {
        agentId: agentId,
        active: active,
        platform: "farcaster",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": A0X_MIRROR_API_KEY,
        },
      }
    );

    const data = response.data;
    console.log("data", data, "response", response);

    if (response.status !== 200) {
      return NextResponse.json(
        { error: "Error activating Farcaster" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Farcaster activated successfully",
        farcasterClient: {
          response: data,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error activating Farcaster:", error);
    return NextResponse.json(
      { error: "Error activating Farcaster" },
      { status: 500 }
    );
  }
}
