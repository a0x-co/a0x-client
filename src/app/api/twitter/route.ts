import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.API_KEY;
const A0X_MIRROR_API_URL = process.env.A0X_MIRROR_API_URL;

export async function POST(request: NextRequest) {
  const { userAddress, accessToken, refreshToken, username, imageUrl, name } =
    await request.json();

  if (
    !userAddress ||
    !accessToken ||
    !refreshToken ||
    !username ||
    !imageUrl ||
    !name
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const userAddressLowerCase = userAddress.toLowerCase();
    const response = await fetch(`${A0X_MIRROR_API_URL}/user/auth/twitter`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAddress: userAddressLowerCase,
        accessToken,
        refreshToken,
        username,
        imageUrl,
        name,
      }),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error saving Twitter account:", error);
    return NextResponse.json(
      { error: "Failed to save Twitter account" },
      { status: 500 }
    );
  }
}
