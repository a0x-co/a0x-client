/* eslint-disable @typescript-eslint/no-explicit-any */
// next
import { NextRequest, NextResponse } from "next/server";

// axios
import axios from "axios";

export const maxDuration = 40;

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

export async function POST(request: NextRequest) {
  console.log("[POST][api/onboarder]");

  const body = await request.json();

  const message = body.message;
  const userAddress = body.userAddress;
  const agentName = body.agentName;

  if (!message || !userAddress || !agentName) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const endpoint = `${A0X_AGENT_API_URL}/a0x-agent/onboarder-manager`;

  const data: {
    message: string;
    userAddress: string;
    agentName: string;
  } = {
    message: message,
    userAddress: userAddress,
    agentName: agentName,
  };

  console.log("data", data);

  try {
    const response = await axios.post(endpoint, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const syntheticResponse = response.data;

    console.log("syntheticResponse", syntheticResponse);
    return NextResponse.json({ syntheticResponse });
  } catch (error: any) {
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return NextResponse.json(
      {
        error: "Failed to synthesize response",
        details: error.message,
        status: error.response?.status,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  console.log("[DELETE][api/onboarder]");

  const body = await request.json();

  const userAddress = body.userAddress?.toLowerCase();

  const endpoint = `${A0X_AGENT_API_URL}/a0x-agent/delete-memory-onboarder`;

  try {
    const response = await axios.delete(
      `${endpoint}?userAddress=${userAddress}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error details:", {
      message: error.message,
    });
  }
}
