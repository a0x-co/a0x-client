import { http } from "wagmi";
import { base } from "viem/chains";
import { createConfig } from "@privy-io/wagmi";

export const metadata = {
  name: "a0x Mirror",
  description: "a0x Mirror",
  url: "https://a0x.xyz/",
  icons: ['"https://a0x.xyz/assets/a0x-logo.svg"'],
};

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});
