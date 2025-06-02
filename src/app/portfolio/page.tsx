"use client";

import { Navbar } from "@/components/Navbar";
import { PortfolioHero } from "@/components/Portfolio/PortfolioHero";
import { PortfolioProjects } from "@/components/Portfolio/PortfolioProjects";
import { useEffect } from "react";

export default function PortfolioPage() {
  useEffect(() => {
    // Prevent extension-related errors from affecting the page
    window.addEventListener('error', (event) => {
      if (event.message.includes('chrome.runtime.sendMessage')) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }, []);

  return (
    <main className="min-h-screen w-full overflow-hidden bg-black">
      <Navbar />
      <PortfolioHero />
      <PortfolioProjects />
    </main>
  );
} 