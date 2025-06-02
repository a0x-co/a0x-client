import { NextRequest, NextResponse } from "next/server";

const A0X_MIRROR_API = process.env.A0X_MIRROR_API;
const A0X_MIRROR_API_KEY = process.env.A0X_MIRROR_API_KEY;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const { postId } = params;

    const response = await fetch(
      `${A0X_MIRROR_API}/api/twitter/scheduled-posts/${postId}`,
      {
        method: "DELETE",
        headers: {
          "x-api-key": A0X_MIRROR_API_KEY!,
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Scheduled post deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting scheduled post:", error);
    return NextResponse.json(
      { error: "Error deleting scheduled post" },
      { status: 500 }
    );
  }
}
