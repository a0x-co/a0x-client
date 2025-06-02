import { NextRequest, NextResponse } from "next/server";

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;
const API_KEY = process.env.API_KEY;
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  let url = `${A0X_AGENT_API_URL}/a0x-framework/agent/${id}/conversations?limit=100`;

  const date = searchParams.get("date");
  const dateTo = searchParams.get("dateTo");
  const limit = searchParams.get("limit");

  if (date) {
    url += `&date=${date}`;
  }
  if (dateTo) {
    url += `&dateTo=${dateTo}`;
  }
  if (limit) {
    url.replace("limit=100", `limit=${limit}`);
  }

  try {
    const response = await fetch(url, {
      headers: {
        "x-api-key": API_KEY!,
      },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get conversations" },
      { status: 500 }
    );
  }
}
