import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.API_KEY;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

export async function POST(request: NextRequest) {
  const { username } = await request.json();

  try {
    const response = await fetch(`${A0X_MIRROR_API_URL}/eliza/deploy`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
      }),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Twitter profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch Twitter profile" },
      { status: 500 }
    );
  }
}
