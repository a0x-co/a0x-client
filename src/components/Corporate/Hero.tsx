"use client";

import { motion } from "framer-motion";
import ParticleEffect from "../Landing/animation/ParticleEffect";

export const CorporateHero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-zinc-900 to-black" />
      
      {/* Minimal grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px)`,
          backgroundSize: '120px'
        }}
      />

      {/* Refined particle effect */}
      <div className="absolute inset-0 pointer-events-none">
        <ParticleEffect
          type="circle"
          color="#fff"
          glowColor="rgba(255, 255, 255, 0.1)"
          count={50}
          size={1}
          animation="spiral"
          speed={0.08}
          spiralWidth={1}
          spiralHeight={1}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="space-y-16"
        >
          <h1 className="text-6xl md:text-8xl font-light text-white tracking-tight leading-none">
            <span className="font-normal">AI</span>
            <span className="mx-4 text-zinc-600">×</span>
            <span className="font-normal">Crypto</span>
            <span className="block mt-6 text-3xl md:text-4xl font-light tracking-[0.2em] text-zinc-500">
              INFRASTRUCTURE
            </span>
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light tracking-wide">
            Decentralized Solutions For Enterprises In The Internet Economy
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <a 
              href="mailto:daniel@a0x.co"
              className="inline-block px-12 py-4 text-sm font-light tracking-widest text-white border border-white/10 rounded-full hover:bg-white/5 transition-all duration-300"
            >
              SCHEDULE CONSULTATION
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}; 