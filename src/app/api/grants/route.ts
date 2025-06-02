import axios from "axios";

// const response = await axios.put(`/api/grants/${id}?status=${status}`);

import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.API_KEY;
const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

export async function PUT(request: NextRequest) {
  const { agentId, id, status, amount } = await request.json();

  if (!agentId || !id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  if (status !== undefined) {
    try {
      const response = await axios.put(
        `${A0X_AGENT_API_URL}/a0x-framework/${agentId}/grants/${id}`,
        {
          status,
          headers: {
            "x-api-key": API_KEY!,
          },
        }
      );

      return NextResponse.json(response.data);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to update grant status" },
        { status: 500 }
      );
    }
  }

  if (amount !== undefined) {
    try {
      const response = await axios.put(
        `${A0X_AGENT_API_URL}/a0x-framework/${agentId}/grants/${id}`,
        {
          amount,
          headers: {
            "x-api-key": API_KEY!,
          },
        }
      );

      return NextResponse.json(response.data);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to update grant amount" },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: NextRequest) {
  const { agentId, id, amount } = await request.json();

  if (!agentId || !id || amount === undefined) {
    return NextResponse.json(
      { error: "Agent ID, Grant ID and Amount are required" },
      { status: 400 }
    );
  }

  try {
    // Llamamos al endpoint del backend para iniciar la transacción
    const response = await axios.post(
      `${A0X_AGENT_API_URL}/a0x-framework/${agentId}/grants/${id}/send`,
      {
        amount,
      },
      {
        headers: {
          "x-api-key": API_KEY!,
        },
      }
    );

    return NextResponse.json({
      message: "Grant transaction initiated",
      txHash: response.data.txHash || null,
      status: response.data.status || "pending",
    });
  } catch (error) {
    console.error("Error sending grant transaction:", error);
    return NextResponse.json(
      { error: "Failed to send grant transaction" },
      { status: 500 }
    );
  }
}
