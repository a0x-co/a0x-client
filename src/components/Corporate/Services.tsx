"use client";

import { motion } from "framer-motion";

export const Services = () => {
  const services = [
    {
      title: "AI Infrastructure",
      description: "Custom-built AI agents and systems designed for enterprise-scale operations and integration."
    },
    {
      title: "System Integration",
      description: "Seamless integration of AI capabilities with existing blockchain and traditional systems."
    }
  ];

  return (
    <section className="py-32 relative bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2 
          className="text-4xl font-light text-black mb-24 tracking-wide"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Services
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 max-w-5xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={i}
              className="border-t border-black/10 pt-12 group hover:bg-black/[0.02] transition-colors duration-500 p-12 rounded-lg cursor-default"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-3xl font-light text-black mb-10 tracking-wide group-hover:text-black/80 transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-zinc-600 font-light leading-relaxed text-lg group-hover:text-zinc-800 transition-colors duration-300">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 