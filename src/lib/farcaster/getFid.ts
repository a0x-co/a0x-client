import neynarClient from "@/lib/farcaster/neynarClient";
import { mnemonicToAccount } from "viem/accounts";

export const getFid = async () => {
  if (!process.env.FARCASTER_DEVELOPER_MNEMONIC) {
    throw new Error("FARCASTER_DEVELOPER_MNEMONIC is not set.");
  }

  const account = mnemonicToAccount(process.env.FARCASTER_DEVELOPER_MNEMONIC);
  console.log("account: ", account);

  // Lookup user details using the custody address.
  const { user: farcasterDeveloper } =
    await neynarClient.lookupUserByCustodyAddress({
      custodyAddress: account.address,
    });

  return Number(farcasterDeveloper.fid);
};
