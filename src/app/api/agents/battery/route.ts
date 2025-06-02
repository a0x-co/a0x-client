import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;
const API_KEY = process.env.A0X_API_KEY;

export async function POST(request: NextRequest) {
  const { agentId } = await request.json();

  if (!agentId) {
    return NextResponse.json(
      { error: "Agent ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.post(
      `${A0X_AGENT_API_URL}/a0x-framework/${agentId}/update-agent-battery`,
      {
        headers: {
          "x-api-key": API_KEY!,
        },
      }
    );

    console.log("🤖 Battery updated successfully", response);
    if (response.status !== 200) {
      return NextResponse.json(
        { error: "Failed to update battery" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Battery updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("🤖 Error updating battery", error);
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }
}
