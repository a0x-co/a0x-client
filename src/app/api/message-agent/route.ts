// next
import { NextRequest, NextResponse } from "next/server";

// axios
import axios from "axios";

export const maxDuration = 60;

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;
const API_KEY = process.env.API_KEY;

export async function POST(request: NextRequest) {
  console.log("[POST][api/message-agent]");
  const { message, userId, agentId, llmModelToUse } = await request.json();
  const data: {
    text: string;
    userId: string;
    llmModelToUse: "gemini-2.5" | "gemini-2.0-fn";
  } = {
    text: message,
    userId: userId,
    llmModelToUse: llmModelToUse,
  };

  const endpoint = `${A0X_AGENT_API_URL}/${agentId}/message`;
  try {
    const response = await axios.post(endpoint, data, {
      headers: {
        "x-api-key": API_KEY!,
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error simulating response:", error);
    
    // Verificar si es un error de Axios y tiene respuesta
    if (axios.isAxiosError(error) && error.response) {
      // Error 503
      if (error.response.status === 503) {
        return NextResponse.json(
          { error: "Service unavailable - Request timed out" },
          { status: 503 }
        );
      }
      
      // Otros errores con código de estado
      return NextResponse.json(
        { error: `Request failed with status ${error.response.status}` },
        { status: error.response.status }
      );
    }

    // Error genérico si no es un error de Axios o no tiene respuesta
    return NextResponse.json(
      { error: "Failed to simulate response" },
      { status: 500 }
    );
  }
}
