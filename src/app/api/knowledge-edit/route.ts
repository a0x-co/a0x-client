import axios from "axios";

import { NextRequest, NextResponse } from "next/server";

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

export async function POST(request: NextRequest) {
  try {
    const { agentId, url, newData } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
    }

    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    if (!newData) {
      return NextResponse.json({ error: "Missing newData" }, { status: 400 });
    }

    const response = await axios.post(
      `${A0X_AGENT_API_URL}/a0x-framework/${agentId}/knowledge-edit`,
      {
        url,
        newData,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error editing knowledge:", error);
    return NextResponse.json(
      { error: "Error editing knowledge" },
      { status: 500 }
    );
  }
}
