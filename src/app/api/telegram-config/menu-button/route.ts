import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_KEY = process.env.API_KEY;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

/**
 * Endpoint para configurar el botón de menú de Telegram para un agente
 * 
 * Este botón puede utilizarse para lanzar una mini app o una webapp
 */
export async function POST(request: NextRequest) {
  console.log("[POST][api/telegram-config/menu-button]");
  
  try {
    const { agentId, webAppUrl, buttonText } = await request.json();
    
    if (!agentId || !webAppUrl) {
      return NextResponse.json(
        { error: "Agent ID and web app URL are required" },
        { status: 400 }
      );
    }
    
    // Enviar solicitud al backend para configurar el botón de menú de Telegram
    const response = await axios.post(
      `${A0X_MIRROR_API_URL}/user/telegram/menu-button`,
      {
        agentId,
        webAppUrl,
        buttonText
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
      message: "Telegram menu button configured successfully",
      menuButtonInfo: response.data
    });
  } catch (error: any) {
    console.error("Error configuring Telegram menu button:", error);
    
    if (error.response) {
      return NextResponse.json(
        { 
          error: "Error configuring Telegram menu button",
          details: error.response.data 
        },
        { status: error.response.status }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to configure Telegram menu button" },
        { status: 500 }
      );
    }
  }
} 