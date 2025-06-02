"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const portfolioProjects = [
  {
    title: "JesseXBT",
    description: "An ai-agent designed to help builders improve their products in web3 and facilitate access to funding, by reviewing their projects, documentation, demos and websites and providing feedback.",
    year: "2025",
    image: "/assets/images/portfolio/jesse2.png",
    link: "https://jessexbt.gitbook.io/jessexbt-docs"
  },
  {
    title: "MoonXBT",
    description: "Content creator ai agent with accounts acroos X, Farcaster, Instagram, TikTok and Zora, creating one video a day for a dayli auction winner to help projects gain attention.",
    year: "2025",
    image: "/assets/images/portfolio/moon.png",
    link: "https://moonxbt.fun"
  },
  {
    title: "A0x AI-agent Factory",
    description: "Ai-agents launchpad based on ElisaOS framework, with a customized RAG system, dynamic knowledge training and token launching capabilities via X and Farcaster.",
    year: "2024",
    image: "/assets/images/portfolio/a0xlaunch.png",
    link: "https://a0x.co"
  },
  {
    title: "Billi.live",
    description: "Ai-agent enabled to launch livestreams both for real users and other agents, the platform allowed the agents to talk by transcoding their text replies to audio.",
    year: "2024",
    image: "/assets/images/portfolio/gmbilli.png",
    link: "https://www.billi.live/"
  },
  {
    title: "Vibra.so",
    description: "Mobile social media client for Farcaster and Lens, optimized for vertical videos, livestreams and creator coins.",
    year: "2024",
    image: "/assets/images/portfolio/vibra_so.png",
    link: "https://vibra.so"
  },
  {
    title: "Wav3s",
    description: "Marketing tool for decentralized social media, allowing users to reward with tokens the engagement of their community and help publications go viral.",
    year: "2023",
    image: "/assets/images/portfolio/wav3s_app.png",
    link: "https://wav3s.app"
  }
];

export const PortfolioProjects = () => {
  return (
    <section className="py-32 relative bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2 
          className="text-4xl font-light text-white mb-24 tracking-wide"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Past Projects
        </motion.h2>

        <div className="space-y-32">
          {portfolioProjects.map((project, i) => (
            <motion.div
              key={i}
              className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="relative overflow-hidden rounded-lg order-2 lg:order-1">
                <motion.div
                  className="aspect-[16/9]"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm text-zinc-500 tracking-widest">{project.year}</span>
                  {project.link && (
                    <a 
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <ArrowUpRight 
                        size={20}
                        className="text-zinc-400 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                      />
                    </a>
                  )}
                </div>

                <h3 className="text-3xl font-light text-white mb-6 tracking-wide group-hover:text-zinc-200 transition-colors duration-300">
                  {project.title}
                </h3>
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