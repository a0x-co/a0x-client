// next
import { NextRequest, NextResponse } from "next/server";

// axios
import axios from "axios";

// types
import { AgentPersonalityElizaFormat } from "@/types";

const API_KEY = process.env.API_KEY;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

export async function GET(request: NextRequest) {
  console.log("[GET][api/personality-agent]");
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");

  if (!handle) {
    return NextResponse.json({ error: "Handle is required" }, { status: 400 });
  }

  try {
    const response = await axios.get(
      `${A0X_MIRROR_API_URL}/personality/${handle}`,
      {
        headers: {
          "x-api-key": API_KEY!,
        },
      }
    );

    const personality = response.data.personality;
    console.log("[GET][api/personality-agent] personality");

    return NextResponse.json(personality);
  } catch (error) {
    console.error("Error fetching personality:", error);
    return NextResponse.json(
      { error: "Failed to fetch personality" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  console.log("[PATCH][api/personality-agent]");

  try {
    const { personality, handle } = (await request.json()) as {
      personality: AgentPersonalityElizaFormat;
      handle: string;
    };

    await axios.patch(
      `${A0X_MIRROR_API_URL}/personality/${handle}`,
      personality,
      {
        headers: {
          "x-api-key": API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({ message: "Personality saved", status: 200 });
  } catch (error) {
    console.error("Error saving personality:", error);
    return NextResponse.json(
      { error: "Failed to save personality" },
      { status: 500 }
    );
  }
}
