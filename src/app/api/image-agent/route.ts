/* eslint-disable @typescript-eslint/no-explicit-any */
// next
import { NextRequest, NextResponse } from "next/server";

// axios
import axios from "axios";

export const maxDuration = 40;

const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

export async function POST(request: NextRequest) {
  console.log("[POST][api/image-agent]");

  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const agentId = formData.get("agentId") as string;

    console.log("imageFile", imageFile);
    console.log("agentId", agentId);

    if (!imageFile) {
      return NextResponse.json(
        { error: "No se proporcionó ninguna imagen" },
        { status: 400 }
      );
    }

    if (!agentId) {
      return NextResponse.json(
        { error: "Se requiere el ID del agente" },
        { status: 400 }
      );
    }

    const endpoint = `${A0X_MIRROR_API_URL}/agents/change-agent-image`;

    const apiFormData = new FormData();
    apiFormData.append("image", imageFile);
    apiFormData.append("agentId", agentId);

    const response = await axios.post(endpoint, apiFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const syntheticResponse = response.data;
    return NextResponse.json({ syntheticResponse });
  } catch (error: any) {
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    console.log("error", error);

    return NextResponse.json(
      {
        error: "Failed to update agent image",
        details: error.message,
        status: error.response?.status,
      },
      { status: error.response?.status || 500 }
    );
  }
}
