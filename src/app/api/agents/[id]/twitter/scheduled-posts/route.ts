import { NextRequest, NextResponse } from "next/server";

const A0X_MIRROR_API = process.env.A0X_MIRROR_API;
const A0X_MIRROR_API_KEY = process.env.A0X_MIRROR_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Obtener las publicaciones programadas del agente
    const response = await fetch(
      `${A0X_MIRROR_API}/api/twitter/scheduled-posts/${id}`,
      {
        headers: {
          "x-api-key": A0X_MIRROR_API_KEY!,
        },
      }
    );

    const scheduledPosts = await response.json();

    return NextResponse.json(
      {
        success: true,
        scheduledPosts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error obteniendo publicaciones programadas:", error);
    return NextResponse.json(
      { error: "Error al obtener las publicaciones programadas" },
      { status: 500 }
    );
  }
}
