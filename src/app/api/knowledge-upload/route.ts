import axios from "axios";

import { NextRequest, NextResponse } from "next/server";

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const agentId = formData.get("agentId") as string;
    const type = formData.get("type") as string;
    const file = formData.get("file") as File;

    if (!agentId) {
      return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append("agentId", agentId);
    backendFormData.append("type", type);
    backendFormData.append("file", file);

    const response = await axios.post(
      `${A0X_AGENT_API_URL}/a0x-framework/${agentId}/knowledge-upload`,
      backendFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error al procesar archivo PDF:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
