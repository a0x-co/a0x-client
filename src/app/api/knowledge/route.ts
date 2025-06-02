import axios from "axios";

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 40;

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;
const API_KEY = process.env.A0X_API_KEY;

export async function POST(request: NextRequest) {
  const { agentId, url, isDynamic, instructions } = await request.json();

  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 });
  }

  try {
    const response = await axios.post(
      `${A0X_AGENT_API_URL}/a0x-framework/${agentId}/knowledge`,
      {
        url: url,
        type: "website",
        isDynamic: isDynamic,
        instructions: instructions,
      },
      {
        headers: {
          "x-api-key": API_KEY!,
        },
      }
    );

    if (response.status !== 200) {
      return NextResponse.json(
        { error: "Failed to update knowledge" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Knowledge updated successfully",
        scrapedData: response.data.scrapedData,
      },
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

export async function PUT(request: NextRequest) {
  const { agentId, url, isDynamic } = await request.json();

  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // Por defecto, el conocimiento es estático si no se especifica
  const isDynamicData = typeof isDynamic === "boolean" ? isDynamic : false;

  try {
    console.log(
      `🔄 Refreshing knowledge for agent ${agentId} from URL: ${url}, Dynamic: ${isDynamicData}`
    );
    const response = await axios.put(
      `${A0X_AGENT_API_URL}/a0x-framework/${agentId}/knowledge`,
      {
        url: url,
      },
      {
        headers: {
          "x-api-key": API_KEY!,
        },
      }
    );

    if (response.status !== 200) {
      console.error(
        "🤖 Error refreshing knowledge, API response:",
        response.data
      );
      return NextResponse.json(
        { error: "Failed to refresh knowledge" },
        { status: response.status || 500 }
      );
    }

    console.log("✅ Knowledge refreshed successfully for", url);
    return NextResponse.json(
      {
        message: "Knowledge refreshed successfully",
        refreshedData: response.data, // Devolvemos la data recibida del backend
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("🤖 Error refreshing knowledge:", error);
    // Intentar devolver un error más específico si es posible
    const status = axios.isAxiosError(error)
      ? error.response?.status || 500
      : 500;
    const message = axios.isAxiosError(error)
      ? error.response?.data?.error || "Failed to refresh knowledge"
      : "Failed to refresh knowledge";
    return NextResponse.json({ error: message }, { status });
  }
}
