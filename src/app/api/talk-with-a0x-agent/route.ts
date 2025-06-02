/* eslint-disable @typescript-eslint/no-explicit-any */
// next
import { NextRequest, NextResponse } from "next/server";

// axios
import axios from "axios";

export const maxDuration = 40;

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

export async function POST(request: NextRequest) {
  console.log("[POST][api/talk-with-a0x-agent]");

  const body = await request.json();

  const message = body.message;
  const userAddress = body.userAddress;

  const agentIdAgentDeployer = "ccbde6be-d141-09aa-9c1d-1899e0eda510";

  const endpoint = `${A0X_AGENT_API_URL}/${agentIdAgentDeployer}/message`;

  const data: {
    text: string;
    userId: string;
  } = {
    text: message,
    userId: userAddress,
  };

  console.log("data", data);

  try {
    const response = await axios.post(endpoint, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const syntheticResponse = response.data;

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
  console.log("[DELETE][api/talk-with-a0x-agent]");

  const body = await request.json();

  const userAddress = body.userAddress?.toLowerCase();

  const endpoint = `${A0X_AGENT_API_URL}/a0x-agent/delete-memory`;

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
