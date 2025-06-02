import axios from "axios";

import { NextRequest, NextResponse } from "next/server";

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;
const API_KEY = process.env.A0X_API_KEY;

export async function POST(request: NextRequest) {
  const { agentId, farcasterAccount } = await request.json();

  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 });
  }

  if (!farcasterAccount) {
    return NextResponse.json(
      { error: "farcasterAccount (handle or FID) is required" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.post(
      `${A0X_AGENT_API_URL}/a0x-framework/${agentId}/knowledge-farcaster-account`,
      {
        farcasterAccount: farcasterAccount,
      },
      {
        headers: {
          "x-api-key": API_KEY!,
        },
      }
    );

    console.log("🤖 Knowledge updated successfully", response);

    if (response.status !== 200) {
      return NextResponse.json(
        { error: "Failed to update knowledge" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Knowledge updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("🤖 Error updating knowledge", error);
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }
}

export async function DELETE(request: NextRequest) {
  const { agentId, url } = await request.json();

  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    const response = await axios.post(
      `${A0X_AGENT_API_URL}/a0x-framework/${agentId}/delete-knowledge`,
      {
        url: url,
      }
    );

    if (response.status !== 200) {
      return NextResponse.json(
        { error: "Failed to delete knowledge" },
        { status: 500 }
      );
    }

    console.log("🤖 Knowledge deleted successfully");

    return NextResponse.json(
      { message: "Knowledge deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("🤖 Error deleting knowledge", error);
    return NextResponse.json(
      { error: "Failed to delete knowledge" },
      { status: 500 }
    );
  }
}
