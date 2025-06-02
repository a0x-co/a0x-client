"use client";

import { Providers } from "@/app/providers";

export default function FrameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
