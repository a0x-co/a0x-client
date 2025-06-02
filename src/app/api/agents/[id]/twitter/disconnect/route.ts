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

    const response = await axios.delete(
      `${A0X_MIRROR_API_URL}/agents/twitter-client?agentId=${id}`,
      {
        headers: {
          "x-api-key": A0X_MIRROR_API_KEY!,
        },
      }
    );

    if (response.status !== 200) {
      return NextResponse.json(
        { error: "Error disconnecting from Twitter" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Disconnected from Twitter successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error disconnecting from Twitter:", error);
    return NextResponse.json(
      { error: "Error disconnecting from Twitter" },
      { status: 500 }
    );
  }
}
