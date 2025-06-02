"use client";

import { CorporateHero } from "@/components/Corporate/Hero";
import { Vision } from "@/components/Corporate/Vision";
import { Services } from "@/components/Corporate/Services";
import { Projects } from "@/components/Corporate/Projects";
import { Repository } from "@/components/Corporate/Repository";
import { Leadership } from "@/components/Corporate/Leadership";
import { Contact } from "@/components/Corporate/Contact";
import { Footer } from "@/components/Landing/Footer";
import { Navbar } from "@/components/Navbar";

export default function CorporatePage() {
  return (
    <main className="min-h-screen w-full overflow-hidden bg-black">
      <Navbar />
      <CorporateHero />
      <Vision />
      <Services />
      <Projects />
      <Repository />
      <Leadership />
      <Contact />
      <Footer />
    </main>
  );
} 