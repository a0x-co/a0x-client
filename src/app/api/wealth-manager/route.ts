/* eslint-disable @typescript-eslint/no-explicit-any */
// next
import { NextRequest, NextResponse } from "next/server";

// axios
import axios from "axios";

export const maxDuration = 40;

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

export async function POST(request: NextRequest) {
  console.log("[POST][api/wealth-manager]");

  const body = await request.json();

  const message = body.message;
  const userAddress = body.userAddress;

  const endpoint = `${A0X_AGENT_API_URL}/a0x-agent/wealth-manager`;

  const data: {
    message: string;
    userAddress: string;
  } = {
    message: message,
    userAddress: userAddress,
  };

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
        error: "Failed to synthesize response from wealth manager",
        details: error.message,
        status: error.response?.status,
      },
      { status: error.response?.status || 500 }
    );
  }
}
