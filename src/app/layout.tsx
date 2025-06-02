// next
import { Metadata } from "next";
import Script from "next/script";
import { headers } from "next/headers";

// styles
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

// components
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/shadcn/toaster";

// tailwind
import { cn } from "@/lib/utils";

// wagmi & wallet-connect
import Web3ModalProvider from "@/context";
import { cookieToInitialState } from "wagmi";
import { LanguageProvider } from "@/context/LanguageContext";
import { config } from "@/config/wagmiConfig";

// auth
import { getServerSession } from "./api/auth/options";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

// metadata
export const metadata: Metadata = {
  title: "A0X - AI Agents",
  description: "Create, customize, and deploy AI agents that work for you.",
  openGraph: {
    title: "A0x Mirror",
    description: "Create your own agent",
    url: "https://a0xmirror.xyz",
    siteName: "A0x Mirror",
    type: "website",
    images: [
      {
        url: "assets/images/og.jpg",
        alt: "A0x Mirror",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await getServerSession();
    const headerList = headers();
    const cookieStr = headerList.get("cookie") ?? "";

    const initialState = cookieToInitialState(config, cookieStr);

    return (
      <html lang="en">
        <body className={cn("text-black", spaceGrotesk.className)}>
          <Web3ModalProvider initialState={initialState} session={session}>
            <LanguageProvider>
              <Toaster />

              <Script
                src="https://plausible.io/js/script.js"
                data-domain="a0x.co"
                defer
              />

              <Navbar />
              {children}
            </LanguageProvider>
          </Web3ModalProvider>
        </body>
      </html>
    );
  } catch (error) {
    console.error("Layout Error:", error);
    return (
      <html lang="en">
        <body className={cn("text-black", spaceGrotesk.className)}>
          <div>Something went wrong. Please try again.</div>
        </body>
      </html>
    );
  }
}
