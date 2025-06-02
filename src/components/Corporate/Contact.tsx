"use client";

import { motion } from "framer-motion";

export const Contact = () => {
  return (
    <section className="pb-0 pt-32 relative bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.h2 
            className="text-4xl font-light text-black mb-12 tracking-wide"
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Connect
          </motion.h2>
          <motion.p 
            className="text-lg text-zinc-600 font-light mb-16 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Schedule a consultation to discuss how our infrastructure can transform your enterprise operations.
          </motion.p>
          <motion.a 
            href="mailto:daniel@a0x.co"
            className="inline-block px-12 py-4 mb-24 text-sm font-light tracking-widest text-black border border-black/10 rounded-full transition-all duration-500 hover:bg-black/5 hover:border-black/20 hover:tracking-[0.2em] hover:px-16"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            CONTACT ENTERPRISE TEAM
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}; 