"use client";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { State } from "wagmi";

import { privyConfig } from "@/config/privyConfig";
import { config } from "@/config/wagmiConfig";
import { AuthKitProvider } from "@farcaster/auth-kit";
import { ChatSheetProvider } from "./ChatSheetContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const authKitConfig = {
  relay: "https://relay.farcaster.xyz",
};

export default function Web3ModalProvider({
  children,

  initialState,
  session,
}: {
  children: ReactNode;
  initialState?: State;
  session?: Session | null;
}) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId || appId === "") {
    throw new Error("PRIVY_APP_ID is not set");
  }
  return (
    <SessionProvider session={session}>
      <PrivyProvider appId={appId} config={privyConfig}>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config} initialState={initialState}>
            <AuthKitProvider config={authKitConfig}>
              <ChatSheetProvider>{children}</ChatSheetProvider>
            </AuthKitProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </SessionProvider>
  );
}
