import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_KEY = process.env.API_KEY;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

/**
 * Endpoint para vincular una cuenta de Telegram existente como administrador
 *
 * Recibe los datos de la cuenta de Telegram vinculada a través de Privy
 * y los envía al backend para establecerla como administrador del agente
 */
export async function POST(request: NextRequest) {
  console.log("[POST][api/telegram-auth/privy-link]");

  try {
    const { telegramData, agentId, privyUserId } = await request.json();

    if (!telegramData || !agentId || !privyUserId) {
      return NextResponse.json(
        { error: "Telegram data, agentId, and privyUserId are required" },
        { status: 400 }
      );
    }

    // Extraer información relevante de la cuenta de Telegram vinculada a Privy
    const telegramInfo = {
      telegramUserId: telegramData.telegramUserId || telegramData.id || "",
      username: telegramData.username || null,
      name:
        telegramData.name ||
        telegramData.firstName ||
        (telegramData.first_name
          ? `${telegramData.first_name} ${telegramData.last_name || ""}`.trim()
          : null),
      photoUrl: telegramData.photoUrl || telegramData.photo_url || null,
      privyUserId: privyUserId,
    };

    // Enviar datos al backend para establecer la cuenta como administrador
    const response = await axios.post(
      `${A0X_MIRROR_API_URL}/user/telegram/auth/login`,
      {
        agentId,
        telegramData: telegramInfo,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY!,
        },
      }
    );

    // Estructura de respuesta para que sea compatible con la interfaz existente
    return NextResponse.json({
      success: true,
      message:
        "Existing Telegram account successfully connected as administrator",
      authData: {
        telegramUserId: telegramInfo.telegramUserId,
        username: telegramInfo.username,
        name: telegramInfo.name,
        photoUrl: telegramInfo.photoUrl,
        lastLogin: new Date().toISOString(),
      },
      isOwner: true,
    });
  } catch (error: any) {
    console.error(
      "Error vinculando cuenta existente como administrador:",
      error
    );

    if (error.response) {
      return NextResponse.json(
        {
          error: "Error connecting existing Telegram account as administrator",
          details: error.response.data,
        },
        { status: error.response.status }
      );
    } else if (error.request) {
      return NextResponse.json(
        { error: "No response from server" },
        { status: 503 }
      );
    } else {
      return NextResponse.json(
        { error: "Error processing account connection" },
        { status: 500 }
      );
    }
  }
}
