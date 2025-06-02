import { NextResponse } from "next/server";
import axios from "axios";
import { getSignedKey } from "@/lib/farcaster/getSignedFarcaster";
import neynarClient from "@/lib/farcaster/neynarClient";

const API_URL = process.env.A0X_MIRROR_API_URL;
const API_KEY = process.env.API_KEY;

export async function POST(request: Request) {
  console.log("[POST][api/signer-farcaster]");
  try {
    const { user, agentId } = await request.json();
    if (!user.fid) {
      return NextResponse.json({ error: "fid is required" }, { status: 400 });
    }

    try {
      const signedKey = await getSignedKey();
      const userWithSignedKey = {
        ...user,
        signer_uuid: signedKey.signer_uuid,
        public_key: signedKey.public_key,
        status: signedKey.status,
        signer_approval_url: signedKey.signer_approval_url,
        agentId: agentId,
      };

      console.log("userWithSignedKey", userWithSignedKey);

      try {
        // Intentar guardar usuario en API externa
        await axios.post(`${API_URL}/user/farcaster`, userWithSignedKey, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
          },
        });
      } catch (postError) {
        console.error("Error posting to external API:", postError);
        // Continuar y devolver los datos aunque falle la API externa
      }

      // Devolver los datos del usuario con el signer
      return NextResponse.json(userWithSignedKey, {
        status: 200,
      });
    } catch (error: any) {
      console.error(
        "Error in POST /api/signer-farcaster",
        error.response?.data || error.message
      );
      return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error general en /api/signer-farcaster:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  console.log("[PUT][api/signer]");
  const { agentId, user } = await req.json();
  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 });
  }
  const data = {
    updates: user,
    agentId: agentId,
  };
  try {
    // Actualizar usuario en API externa
    const updateResponse = await axios.put(
      `${API_URL}/user/farcaster/${user.signer_uuid}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
      }
    );

    if (updateResponse.status !== 200) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 400 }
      );
    }

    return NextResponse.json("Farcaster signer updated successfully", {
      status: 200,
    });
  } catch (error: any) {
    console.error(
      "Error in PUT /api/signer",
      error.response?.data || error.message
    );
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  console.log("[GET][api/signer]");
  const { searchParams } = new URL(req.url);
  const fid = searchParams.get("fid");
  const signer_uuid = searchParams.get("signer_uuid");

  if (signer_uuid && !fid) {
    const signer = await neynarClient.lookupSigner({ signerUuid: signer_uuid });
    return NextResponse.json(signer, { status: 200 });
  }

  try {
    try {
      const userResponse = await axios.get(`${API_URL}/user/farcaster/${fid}`, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        params: {
          identifier: "fid",
        },
      });

      if (userResponse.status === 200 && userResponse.data) {
        return NextResponse.json(userResponse.data, { status: 200 });
      }
    } catch (apiError) {
      console.log("User not found in external API, checking Neynar");
    }
  } catch (error: any) {
    console.error(
      "Error in GET /api/signer",
      error.response?.data || error.message
    );
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
