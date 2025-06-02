"use client";

import { motion } from "framer-motion";

// Animation
import ParticleEffect from "./animation/ParticleEffect";

// Context
import { useLanguage } from "@/context/LanguageContext";
import { useChatSheet } from "@/context/ChatSheetContext";
import Link from "next/link";

export const Hero = () => {
  const { t } = useLanguage();

  const { setTrigger, setIsOpen } = useChatSheet();

  const handleCreateAgent = () => {
    setTrigger("create_agent");
    setIsOpen(true);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-90" />
      <div className="absolute inset-0 pointer-events-none text-cyan-400">
        <ParticleEffect
          type="circle"
          color="#22d3ee"
          glowColor="rgba(79, 209, 197, 0.6)"
          count={80}
          size={1.5}
          animation="spiral"
          speed={0.5}
          tilt={90}
          spiralWidth={0.5}
          spiralHeight={0.7}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-32 text-center relative z-10">
        <motion.h1
          className="text-6xl md:text-8xl font-bold text-white mb-20 tracking-tight drop-shadow-lg"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {t.hero.title}
        </motion.h1>
        <motion.p
          className="text-2xl text-gray-400 max-w-3xl mx-auto text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="font-mono text-cyan-400">{">"}</span>{" "}
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          className="mt-20 flex items-center justify-center gap-6 flex-col sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button
            onClick={handleCreateAgent}
            className="px-8 py-3 rounded-xl text-white text-lg font-medium bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-xl shadow-cyan-500/30"
          >
            {t.hero.createButton}
          </button>

          <Link
            href="https://app.uniswap.org/swap?exactField=input&outputCurrency=0x820C5F0fB255a1D18fd0eBB0F1CCefbC4D546dA7&chain=base&theme=dark"
            target="_blank"
            className="px-8 py-3 rounded-xl text-cyan-600 text-lg font-medium bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 transition-all duration-300 shadow-xl shadow-cyan-500/30"
          >
            {t.hero.buyA0x}
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
