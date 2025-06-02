import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_KEY = process.env.API_KEY;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

/**
 * Endpoint para autenticar un administrador con Telegram Login Widget
 *
 * Recibe los datos del widget de Telegram y los envía al backend para verificación
 * Los datos incluyen: id, first_name, last_name, username, photo_url, auth_date y hash
 */
export async function POST(request: NextRequest) {
  console.log("[POST][api/telegram-auth]");

  try {
    const { telegramData, agentId } = await request.json();

    if (!telegramData || !agentId) {
      return NextResponse.json(
        { error: "Telegram data and agentId are required" },
        { status: 400 }
      );
    }

    // Validar que los datos de Telegram tengan la estructura correcta
    if (!telegramData.id || !telegramData.auth_date || !telegramData.hash) {
      return NextResponse.json(
        { error: "Invalid Telegram authentication data structure" },
        { status: 400 }
      );
    }

    // Enviar datos completos al backend para verificación criptográfica
    const response = await axios.post(
      `${A0X_MIRROR_API_URL}/user/telegram/auth/login`,
      {
        telegramData,
        agentId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY!,
        },
      }
    );

    // Formatear respuesta para la UI
    const authData = response.data.authData || {};
    const telegramOwnerData = {
      telegramUserId: authData.telegramUserId || "",
      username: authData.username || null,
      name: authData.name || null,
      photoUrl: authData.photoUrl || null,
      lastLogin: authData.lastLogin || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message:
        response.data.message || "Administrator authenticated successfully",
      authData: telegramOwnerData,
      isOwner: true,
    });
  } catch (error: any) {
    console.error("Error en autenticación de administrador:", error);

    // Manejo específico del error
    if (error.response) {
      // El servidor respondió con un código de error
      return NextResponse.json(
        {
          error: "Error authenticating administrator",
          details: error.response.data,
        },
        { status: error.response.status }
      );
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      return NextResponse.json(
        { error: "No response from authentication server" },
        { status: 503 }
      );
    } else {
      // Error al configurar la solicitud
      return NextResponse.json(
        { error: "Error setting up authentication request" },
        { status: 500 }
      );
    }
  }
}

/**
 * Endpoint para obtener el administrador de Telegram para un agente
 */
export async function GET(request: NextRequest) {
  console.log("[GET][api/telegram-auth]");

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  if (!agentId) {
    return NextResponse.json(
      { error: "Agent ID is required" },
      { status: 400 }
    );
  }

  try {
    // Obtener el administrador de Telegram
    const response = await axios.get(
      `${A0X_MIRROR_API_URL}/user/telegram/auth/${agentId}/owner`,
      {
        headers: {
          "x-api-key": API_KEY!,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error obteniendo administrador de Telegram:", error);

    if (error.response) {
      return NextResponse.json(
        {
          error: "Error fetching Telegram administrator",
          details: error.response.data,
        },
        { status: error.response.status }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to fetch Telegram administrator" },
        { status: 500 }
      );
    }
  }
}
