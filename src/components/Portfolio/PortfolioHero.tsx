"use client";

import { motion } from "framer-motion";

export const PortfolioHero = () => {
  return (
    <section className="min-h-[80vh] flex items-center justify-center relative bg-black">
      <div className="max-w-7xl mx-auto px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-light text-white mb-8 tracking-wide">
            Our Portfolio
          </h1>
          <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
            A collection of our most impactful projects and achievements in blockchain technology, 
            artificial intelligence, and system integration.
          </p>
        </motion.div>
      </div>
    </section>
  );
}; 