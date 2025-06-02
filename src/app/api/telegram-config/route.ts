import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_KEY = process.env.API_KEY;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

/**
 * Endpoint para configurar/crear el cliente de Telegram para un agente
 */
export async function POST(request: NextRequest) {
  console.log("[POST][api/telegram-config]");
  
  try {
    const { agentId, botToken } = await request.json();
    
    if (!agentId || !botToken) {
      return NextResponse.json(
        { error: "Agent ID and bot token are required" },
        { status: 400 }
      );
    }
    
    // Enviar solicitud al backend para configurar el cliente de Telegram
    const response = await axios.post(
      `${A0X_MIRROR_API_URL}/user/telegram`,
      {
        agentId,
        botToken
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
      message: "Telegram client configured successfully",
      telegramClient: response.data.telegramClient
    });
  } catch (error: any) {
    console.error("Error configuring Telegram client:", error);
    
    if (error.response) {
      return NextResponse.json(
        { 
          error: "Error configuring Telegram client",
          details: error.response.data 
        },
        { status: error.response.status }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to configure Telegram client" },
        { status: 500 }
      );
    }
  }
}

/**
 * Endpoint para obtener la configuración de Telegram de un agente
 */
export async function GET(request: NextRequest) {
  console.log("[GET][api/telegram-config]");
  
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  
  if (!agentId) {
    return NextResponse.json(
      { error: "Agent ID is required" },
      { status: 400 }
    );
  }
  
  try {
    // Obtener información del cliente de Telegram
    const response = await axios.get(
      `${A0X_MIRROR_API_URL}/user/telegram/${agentId}`,
      {
        headers: {
          "x-api-key": API_KEY!
        }
      }
    );
    
    // Obtener información del propietario del bot de Telegram (único usuario autorizado)
    let telegramOwner = null;
    try {
      const ownerResponse = await axios.get(
        `${A0X_MIRROR_API_URL}/user/telegram/auth/${agentId}/owner`,
        {
          headers: {
            "x-api-key": API_KEY!
          }
        }
      );
      if (ownerResponse.data && ownerResponse.data.owner) {
        telegramOwner = ownerResponse.data.owner;
      }
    } catch (ownerError) {
      console.error("Error fetching Telegram owner:", ownerError);
      // Si hay un error, simplemente no establecemos el propietario
    }
    
    // Verificar si hay un webhook configurado
    let webhookConfigured = false;
    if (response.data.telegramClient) {
      webhookConfigured = !!response.data.telegramClient.webhook;
    }
    
    // Obtener el nombre de usuario del bot si está disponible
    let botUsername = "";
    if (response.data.telegramClient && response.data.telegramClient.botInfo) {
      botUsername = response.data.telegramClient.botInfo.username;
    }
    
    // Combinar datos
    const telegramConfig = {
      botToken: response.data.telegramClient?.botToken || "",
      status: response.data.telegramClient?.status || "not_configured",
      webhookConfigured,
      botUsername,
      telegramOwner
    };
    
    return NextResponse.json(telegramConfig);
  } catch (error: any) {
    console.error("Error fetching Telegram configuration:", error);
    
    if (error.response && error.response.status === 404) {
      // Si no hay configuración, devolver un objeto vacío con estado "not_configured"
      return NextResponse.json({
        botToken: "",
        status: "not_configured",
        webhookConfigured: false,
        botUsername: "",
        telegramOwner: null
      });
    }
    
    if (error.response) {
      return NextResponse.json(
        { 
          error: "Error fetching Telegram configuration",
          details: error.response.data 
        },
        { status: error.response.status }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to fetch Telegram configuration" },
        { status: 500 }
      );
    }
  }
} 