/* eslint-disable @typescript-eslint/no-explicit-any */
// next
import { NextRequest, NextResponse } from "next/server";

// axios
import axios from "axios";
import { AgentPersonalityElizaFormat } from "@/types";

export const maxDuration = 40;

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

export async function POST(request: NextRequest) {
  console.log("[POST][api/build-personality]");

  const body = await request.json();

  const userAddress = body.userAddress;
  const agentName = body.agentName;
  const personalityJson = body.personalityJson;
  const endpoint = `${A0X_AGENT_API_URL}/a0x-agent/finalize-build-personality`;

  const data: {
    userAddress: string;
    agentName: string;
    personalityJson: AgentPersonalityElizaFormat;
  } = {
    userAddress: userAddress,
    agentName: agentName,
    personalityJson: personalityJson,
  };

  try {
    const response = await axios.post(endpoint, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const finalizeResponse = response.data;
    return NextResponse.json({ finalizeResponse });
  } catch (error: any) {
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return NextResponse.json(
      {
        error: "Failed to finalize build personality",
        details: error.message,
        status: error.response?.status,
      },

      { status: error.response?.status || 500 }
    );
  }
}
