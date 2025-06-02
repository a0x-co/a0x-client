"use client";

import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { Terminal } from "lucide-react";

export const Repository = () => {
  return (
    <section className="py-32 relative bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-12">
            <Terminal size={24} className="text-black" />
            <motion.h2 
              className="text-4xl font-light text-black tracking-wide"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Open Source
            </motion.h2>
          </div>
          
          <motion.p 
            className="text-lg text-zinc-600 max-w-2xl font-light mb-16 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Check out our public repositories and contribute to our ecosystem
          </motion.p>

          <motion.a
            href="https://github.com/a0x-company"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center space-x-4 text-white bg-[#24292f] rounded-md px-8 py-4 hover:bg-[#1b1f24] transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaGithub size={24} />
            <span className="font-mono tracking-tight">github.com/a0x-company</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}; 