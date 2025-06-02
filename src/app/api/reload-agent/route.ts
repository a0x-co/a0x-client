/* eslint-disable @typescript-eslint/no-explicit-any */
// next
import { NextRequest, NextResponse } from "next/server";

// axios
import axios from "axios";

export const maxDuration = 40;

export async function POST(request: NextRequest) {
  console.log("[POST][api/reload-agent]");

  const body = await request.json();

  const characterName = body.characterName;
  const endpoint = `${body.endpoint}/reload`;

  const data: {
    characterName: string;
  } = {
    characterName: characterName,
  };

  try {
    const response = await axios.post(endpoint, data, {
      headers: {
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
        error: "Failed to reload agent",
        details: error.message,
        status: error.response?.status,
      },

      { status: error.response?.status || 500 }
    );
  }
}
