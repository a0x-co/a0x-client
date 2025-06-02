import type { PrivyClientConfig } from "@privy-io/react-auth";

// Replace this with your Privy config
export const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    showWalletUIs: true,
  },
  loginMethods: ["email", "wallet", "twitter", "telegram", "farcaster"],
  appearance: {
    showWalletLoginFirst: true,
    theme: "dark",
  },
};
