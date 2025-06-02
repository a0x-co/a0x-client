import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;
const A0X_MIRROR_API_KEY = process.env.API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { creatorAddress, agentId } = await request.json();

    if (!creatorAddress || !agentId) {
      return NextResponse.json(
        { error: "All Twitter authentication cookies are required" },
        { status: 400 }
      );
    }

    // Actualizar el documento del agente con la información de Twitter
    const response = await axios.post(
      `${A0X_MIRROR_API_URL}/agents/creator-address`,
      {
        creatorAddress: creatorAddress,
        agentId: agentId,
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
        { error: "Error connecting to Twitter" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Connected to Twitter successfully",
        twitterClient: {
          response: data,
          status: "approved",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error connecting to Twitter:", error);
    return NextResponse.json(
      { error: "Error connecting to Twitter" },
      { status: 500 }
    );
  }
}
