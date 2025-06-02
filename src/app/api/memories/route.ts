import { NextResponse } from "next/server";

import axios from "axios";

const API_KEY = process.env.API_KEY;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

export const fetchCache = "force-no-store";
export const dynamic = "auto";

export async function GET(request: Request) {
  console.log("[GET] /api/memories");

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  try {
    const response = await axios.get(
      `${A0X_MIRROR_API_URL}/agents/memories?agentId=${agentId}`,
      {
        headers: {
          "x-api-key": API_KEY!,
        },
      }
    );

    const { data } = response;

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response
    ) {
      if (error.response.status === 429) {
        return NextResponse.json({
          data: "too many requests. Please try again later.",
        });
      }
    }

    return NextResponse.json({ error });
  }
}

export async function DELETE(request: Request) {
  console.log("[DELETE] /api/memories");

  const { searchParams } = new URL(request.url);
  const memoryId = searchParams.get("memoryId");

  try {
    const response = await axios.delete(
      `${A0X_MIRROR_API_URL}/agents/memory?memoryId=${memoryId}`,
      {
        headers: {
          "x-api-key": API_KEY!,
        },
      }
    );

    const { data } = response;

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response
    ) {
      if (error.response.status === 429) {
        return NextResponse.json({
          data: "too many requests. Please try again later.",
        });
      }
    }

    return NextResponse.json({ error });
  }
}

export const revalidate = 0;
