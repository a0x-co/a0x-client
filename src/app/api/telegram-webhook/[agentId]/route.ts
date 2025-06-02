import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

/**
 * Endpoint que recibe las actualizaciones de Telegram a través del webhook
 * 
 * Este endpoint recibe las actualizaciones de Telegram cuando alguien interactúa con el bot
 * y las reenvía al servicio del agente para procesarlas
 */
export async function POST(
  request: NextRequest, 
  { params }: { params: { agentId: string } }
) {
  console.log(`[POST][api/telegram-webhook/${params.agentId}]`);
  
  try {
    const agentId = params.agentId;
    
    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }
    
    // Obtener datos de la actualización de Telegram
    const telegramUpdate = await request.json();
    
    // Reenviar la actualización al backend del agente
    await axios.post(
      `${A0X_AGENT_API_URL}/telegram/webhook/${agentId}`,
      telegramUpdate,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    
    // Devolver una respuesta exitosa a Telegram
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error processing Telegram webhook:", error);
    
    // Devolver una respuesta exitosa a Telegram para evitar reintentos
    // aunque haya habido un error en el procesamiento
    return NextResponse.json({ ok: true });
  }
} 