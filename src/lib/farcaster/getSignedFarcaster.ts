// neynar
import neynarClient from "@/lib/farcaster/neynarClient";

// viem
import { ViemLocalEip712Signer } from "@farcaster/hub-nodejs";
import { bytesToHex, hexToBytes } from "viem";
import { mnemonicToAccount } from "viem/accounts";

// farcaster
import { getFid } from "@/lib/farcaster/getFid";

export const getSignedKey = async () => {
  console.log("getSignedKey", neynarClient);
  let createSigner;
  try {
    createSigner = await neynarClient.createSigner();
  } catch (error) {
    console.error("Error in getSignedKey", error);
    throw error;
  }

  console.log("createSigner: ", createSigner);
  const { deadline, signature } = await generate_signature(
    createSigner.public_key
  );

  console.log("deadline: ", deadline);
  console.log("signature: ", signature);

  if (deadline === 0 || signature === "") {
    throw new Error("Failed to generate signature");
  }

  const fid = await getFid();

  const signedKey = await neynarClient.registerSignedKey({
    signerUuid: createSigner.signer_uuid,
    appFid: fid,
    deadline,
    signature,
  });

  return signedKey;
};

const generate_signature = async function (public_key: string) {
  console.log("generate_signature");
  if (typeof process.env.FARCASTER_DEVELOPER_MNEMONIC === "undefined") {
    throw new Error("FARCASTER_DEVELOPER_MNEMONIC is not defined");
  }

  const FARCASTER_DEVELOPER_MNEMONIC = process.env.FARCASTER_DEVELOPER_MNEMONIC;
  const FID = await getFid();

  console.log("FID: ", FID);

  const account = mnemonicToAccount(FARCASTER_DEVELOPER_MNEMONIC);
  const appAccountKey = new ViemLocalEip712Signer(account as any);

  // Generates an expiration date for the signature (24 hours from now).
  const deadline = Math.floor(Date.now() / 1000) + 86400;

  const uintAddress = hexToBytes(public_key as `0x${string}`);

  const signature = await appAccountKey.signKeyRequest({
    requestFid: BigInt(FID),
    key: uintAddress,
    deadline: BigInt(deadline),
  });

  if (signature.isErr()) {
    return {
      deadline,
      signature: "",
    };
  }

  const sigHex = bytesToHex(signature.value);

  return { deadline, signature: sigHex };
};
