import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.API_KEY;
const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

/* GET ALL AGENTS */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const address = searchParams.get("address");

  if (name) {
    console.log("[GET][api/agents] by", name);
    try {
      const response = await fetch(
        `${A0X_AGENT_API_URL}/a0x-framework/search?name=${name}`,
        {
          headers: {
            "x-api-key": API_KEY!,
          },
        }
      );
      console.log("response", response);
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error("Error fetching agent:", error);
      return NextResponse.json(
        { error: "Failed to fetch agent" },
        { status: 500 }
      );
    }
  }

  if (address) {
    console.log("[GET][api/agents] by", address);
    try {
      const response = await fetch(
        `${A0X_MIRROR_API_URL}/agents/address?address=${address}`,
        {
          headers: {
            "x-api-key": API_KEY!,
          },
        }
      );
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error("Error fetching agent:", error);
      return NextResponse.json(
        { error: "Failed to fetch agent" },
        { status: 500 }
      );
    }
  }

  console.log("[GET][api/agents]");

  try {
    const response = await fetch(`${A0X_MIRROR_API_URL}/agents`, {
      headers: {
        "x-api-key": API_KEY!,
      },
    });

    const data = await response.json();
    if (data.error) {
      return NextResponse.json(
        { error: "Failed to fetch agents" },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { agentId } = await request.json();

  console.log("[DELETE] /api/agents", agentId);

  try {
    const response = await fetch(
      `${A0X_MIRROR_API_URL}/agents?agentId=${agentId}`,
      {
        headers: {
          "x-api-key": API_KEY!,
        },
        method: "DELETE",
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting memories:", error);
    return NextResponse.json(
      { error: "Failed to delete memories" },
      { status: 500 }
    );
  }
}
