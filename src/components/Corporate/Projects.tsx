"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    title: "A0X AI Agents Factory",
    description: "Enterprise-grade platform for creating, customizing, and deploying unique and powerful AI agents within the crypto industry.",
    status: "Live",
    link: "https://a0x.co"
  },
  {
    title: "CLPD Stablecoin",
    description: "The chilean peso stablecoin, a fully backed intitutional-level stablecoin built to bring the chilean economy to the next level, supported by base.",
    status: "Development",
    link: "https://clpd.a0x.co"
  },
  {
    title: "Portfolio",
    description: "Explore our past projects and achievements in blockchain, AI, and system integration. A showcase of our expertise and successful implementations.",
    status: "View Projects",
    link: "/portfolio"
  }
];

export const Projects = () => {
  return (
    <section className="py-32 relative bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2 
          className="text-4xl font-light text-white mb-24 tracking-wide"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Projects
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-7xl mx-auto">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="border-t border-white/10 pt-12">
                <span className="text-sm text-zinc-500 tracking-widest uppercase">{project.status}</span>
                <div className="flex items-center gap-3 mt-4 mb-8">
                  <h3 className="text-2xl font-light text-white tracking-wide group-hover:text-zinc-200 transition-colors duration-300">
                    {project.title}
                  </h3>
                  {project.link && (
                    <a 
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <ArrowUpRight 
                        size={24}
                        className="text-zinc-400 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                      />
                    </a>
                  )}
                </div>
                <p className="text-zinc-400 font-light leading-relaxed text-lg">
                  {project.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 