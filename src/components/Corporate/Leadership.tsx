"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const team = [
  {
    name: "Daniel Beltrán",
    role: "Founder & CEO",
    image: "/assets/images/team/daniel.png", 
    description: "Engineer and Entrepreneur with expertise in decentralized systems and AI-automation.",
    linkedin: "https://www.linkedin.com/in/danielbeltranv/"
  },
  {
    name: "Claudio Condor",
    role: "Lead Backend Developer",
    image: "/assets/images/team/claudio.png",
    description: "Expert in scalable backend architectures and blockchain integration.",
    github: "https://github.com/claucondor"
  },
  {
    name: "Matias Palomo",
    role: "Lead Frontend Developer",
    image: "/assets/images/team/matias.jpeg",
    description: "Specialist in modern web technologies and user experience design integrating blockchain capabilities.",
    github: "https://github.com/Matiaspp96"
  }
];

export const Leadership = () => {
  return (
    <section className="py-32 relative bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2 
          className="text-4xl font-light text-white mb-24 tracking-wide"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Leadership
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {team.map((member, i) => (
            <motion.div
              key={i}
              className="group flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="relative mb-8 overflow-hidden w-full max-w-[280px]">
                <motion.div
                  className="aspect-[3/4]"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="w-full"
              >
                <div className="flex flex-col items-center gap-3 mb-3">
                  <h3 className="text-xl font-light text-white tracking-wide">
                    {member.name}
                  </h3>
                  <div className="flex gap-4">
                    {member.github && (
                      <a 
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-zinc-200 transition-colors duration-300"
                      >
                        <FaGithub size={18} />
                      </a>
                    )}
                    {member.linkedin && (
                      <a 
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-zinc-200 transition-colors duration-300"
                      >
                        <FaLinkedin size={18} />
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-zinc-400 font-light mb-4 tracking-wider text-sm">
                  {member.role}
                </p>
                <p className="text-zinc-500 font-light leading-relaxed text-sm max-w-[280px] mx-auto">
                  {member.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 