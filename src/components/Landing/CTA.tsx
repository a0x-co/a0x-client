"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export const CTA = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 text-center">
      <motion.h2 
        className="text-5xl md:text-6xl font-bold text-black mb-8 whitespace-pre-line"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <span className="font-mono text-cyan-500 opacity-60">{">"}</span>{" "}
        {t.cta.title}
      </motion.h2>

      <motion.a
        href="/create-agent"
        className="inline-block px-8 py-4 rounded-xl text-white text-lg font-medium 
                 bg-gradient-to-br from-orange-500 to-orange-600 
                 hover:from-orange-600 hover:to-orange-700 
                 transition-all duration-300 shadow-xl shadow-orange-500/30"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {t.cta.button}
      </motion.a>
    </section>
  );
}; 