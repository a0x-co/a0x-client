import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

export async function POST(request: NextRequest) {
  try {
    const { authCookie, csrfToken, twid, agentId } = await request.json();

    if (!authCookie || !csrfToken || !twid || !agentId) {
      return NextResponse.json(
        { error: "All Twitter authentication cookies are required" },
        { status: 400 }
      );
    }

    // Actualizar el documento del agente con la información de Twitter
    const response = await axios.post(
      `${A0X_AGENT_API_URL}/a0x-framework/update-twitter-credentials`,
      {
        agentId: agentId,
        auth: authCookie,
        ct0: csrfToken,
        twid: twid,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;
    console.log("data", data, "response", response);

    if (response.status !== 200) {
      return NextResponse.json(
        { error: "Error connecting to Twitter" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Connected to Twitter successfully",
        twitterClient: {
          response: data,
          status: "approved",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error connecting to Twitter:", error);
    return NextResponse.json(
      { error: "Error connecting to Twitter" },
      { status: 500 }
    );
  }
}
