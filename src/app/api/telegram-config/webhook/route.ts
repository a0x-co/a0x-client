import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_KEY = process.env.API_KEY;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

/**
 * Endpoint para configurar el webhook de Telegram para un agente
 */
export async function POST(request: NextRequest) {
  console.log("[POST][api/telegram-config/webhook]");
  
  try {
    const { agentId, webhookUrl } = await request.json();
    
    if (!agentId || !webhookUrl) {
      return NextResponse.json(
        { error: "Agent ID and webhook URL are required" },
        { status: 400 }
      );
    }
    
    // Enviar solicitud al backend para configurar el webhook de Telegram
    const response = await axios.post(
      `${A0X_MIRROR_API_URL}/user/telegram/webhook`,
      {
        agentId,
        webhookUrl
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY!
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      message: "Telegram webhook configured successfully",
      webhookInfo: response.data
    });
  } catch (error: any) {
    console.error("Error configuring Telegram webhook:", error);
    
    if (error.response) {
      return NextResponse.json(
        { 
          error: "Error configuring Telegram webhook",
          details: error.response.data 
        },
        { status: error.response.status }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to configure Telegram webhook" },
        { status: 500 }
      );
    }
  }
} 