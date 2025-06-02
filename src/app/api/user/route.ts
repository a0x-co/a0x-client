import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.API_KEY;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  console.log("[GET][api/user] by", address);
  try {
    const response = await fetch(
      `${A0X_MIRROR_API_URL}/user/${address?.toLowerCase()}`,
      {
        headers: {
          "x-api-key": API_KEY!,
        },
      }
    );
    const data = await response.json();
    console.log("data users", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: `Failed to fetch user: ${error}` },
      { status: 500 }
    );
  }
}
