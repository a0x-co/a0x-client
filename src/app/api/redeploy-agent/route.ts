/* eslint-disable @typescript-eslint/no-explicit-any */
// next
import { NextRequest, NextResponse } from "next/server";

// axios
import axios from "axios";

export const maxDuration = 40;

const API_KEY = process.env.API_KEY;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

export async function POST(request: NextRequest) {
  console.log("[POST][api/redeploy-agent]");

  const body = await request.json();

  const agentName = body.agentName;
  const actions = [
    {
      type: "twitterPostAction", // TODO: add more actions
      username: body.username,
    },
  ];
  const endpoint = `${A0X_MIRROR_API_URL}/eliza/re-deploy`;

  const data: {
    agentName: string;
    actions: {
      type: string;
      username: string;
    }[];
  } = {
    agentName: agentName,
    actions: actions,
  };

  try {
    const response = await axios.post(endpoint, data, {
      headers: {
        "x-api-key": API_KEY!,
        "Content-Type": "application/json",
      },
    });

    const reloadResponse = response.data;
    return NextResponse.json({ reloadResponse });
  } catch (error: any) {
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return NextResponse.json(
      {
        error: "Failed to redeploy agent",
        details: error.message,
        status: error.response?.status,
      },

      { status: error.response?.status || 500 }
    );
  }
}
