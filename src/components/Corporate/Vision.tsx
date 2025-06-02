"use client";

import { motion } from "framer-motion";

export const Vision = () => {
  return (
    <section className="py-32 relative bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group"
          >
            <h2 className="text-4xl font-light text-white mb-12 tracking-wide group-hover:text-zinc-200 transition-colors duration-300">
              Vision
            </h2>
            <p className="text-lg text-zinc-400 font-light leading-relaxed transform group-hover:text-zinc-300 transition-all duration-300">
              To establish the definitive infrastructure layer where artificial intelligence and blockchain converge, enabling a new paradigm of trustless, intelligent systems.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="group"
          >
            <h2 className="text-4xl font-light text-white mb-12 tracking-wide group-hover:text-zinc-200 transition-colors duration-300">
              Mission
            </h2>
            <p className="text-lg text-zinc-400 font-light leading-relaxed transform group-hover:text-zinc-300 transition-all duration-300">
              Delivering enterprise-grade solutions that seamlessly integrate AI capabilities with blockchain technology, transforming how businesses operate in the digital economy.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}; 