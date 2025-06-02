import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.API_KEY;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentName = searchParams.get("agentName");

  if (!agentName) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${A0X_MIRROR_API_URL}/agents/configure-twitter?agentName=${agentName}`
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { agentName, task } = await request.json();

  if (!agentName || !task) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${A0X_MIRROR_API_URL}/agents/configure-twitter`,
      {
        method: "POST",
        headers: {
          "x-api-key": API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentName,
          task,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error saving task:", error);
    return NextResponse.json({ error: "Failed to save task" }, { status: 500 });
  }
}
