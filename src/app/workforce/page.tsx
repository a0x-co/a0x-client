"use client";

// components
import { AgentsSection } from "@/components/Home/AgentsSection";
import ParticleEffect from "@/components/Landing/animation/ParticleEffect";

export default function Workforce() {
  return (
    <main className="min-h-screen bg-transparent relative">
      <div className="animated-bg fixed inset-0 w-full min-h-screen" />

      {/* Refined particle effect */}
      <ParticleEffect
        type="circle"
        color="#000000"
        glowColor="rgba(0, 0, 0, 1)"
        count={80}
        size={1}
        animation="spiral"
        speed={0.1}
        spiralWidth={1.2}
        spiralHeight={1.2}
        className="!fixed !h-screen max-w-[99.9%] -z-10"
      />

      <div className="relative max-w-6xl mx-auto mt-[100px] z-10">
        <AgentsSection />
      </div>
    </main>
  );
}
