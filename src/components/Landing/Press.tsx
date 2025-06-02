"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Trophy, Newspaper } from "lucide-react";

export const Press = () => {
  const { t } = useLanguage();

  return (
    <section className="relative py-0 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl font-bold text-black mb-6">
            {t.press.title}
          </h2>
          <p className="text-2xl md:text-3xl text-gray-600 sm:px-6 lg:px-8">
            {t.press.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gaia Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group h-full"
          >
            <div
              className="h-full rounded-2xl bg-white p-8 border border-gray-100
                          shadow-lg hover:shadow-xl
                          transition-all duration-500"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-8 mb-6">
                  <div
                    className="relative w-32 h-32 flex-shrink-0 bg-white rounded-xl p-6
                               group-hover:scale-105 transition-transform duration-500"
                  >
                    <Image
                      src="/assets/images/gaia-word-black.png"
                      alt="Gaia"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl bg-white flex items-center justify-center
                                group-hover:scale-110 transition-transform duration-500"
                    >
                      <Trophy className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-black">
                      First Place Winner
                    </h3>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl text-orange-500 mb-4">
                    Gaia Autonomous Hackathon 2024
                  </h4>
                  <p className="text-gray-600 mb-6">
                    A0X won first place in the first-ever fully autonomous
                    hackathon, showcasing our expertise in AI agent development
                    and autonomous systems.
                  </p>
                </div>
                <a
                  href="https://www.gaianet.ai/blog/gaia-first-autonomous-hackathon/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-base font-medium
                           bg-gradient-to-r from-orange-500 to-orange-600
                           hover:from-orange-600 hover:to-orange-700
                           transition-all duration-300 w-fit"
                >
                  {t.press.readMore}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Infogate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="group h-full"
          >
            <div
              className="h-full rounded-2xl bg-white p-8 border border-gray-100
                          shadow-lg hover:shadow-xl
                          transition-all duration-500"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-8 mb-6">
                  <div
                    className="relative w-32 h-32 flex-shrink-0 bg-white rounded-xl p-6
                               group-hover:scale-105 transition-transform duration-500"
                  >
                    <Image
                      src="/assets/images/infogate.png"
                      alt="Infogate"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl bg-white flex items-center justify-center
                                group-hover:scale-110 transition-transform duration-500"
                    >
                      <Newspaper className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-black">
                      Innovation in AI
                    </h3>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl text-orange-500 mb-4">
                    Billi.live: A Revolutionary Project
                  </h4>
                  <p className="text-gray-600 mb-6">
                    &quot;In Chile there&apos;s real AI talent. The discussion
                    about agents is already established, and thanks to our
                    team&apos;s work, we&apos;re well-positioned to meet the
                    demands of companies needing this technology.&quot;
                  </p>
                </div>
                <a
                  href="https://infogate.cl/2025/01/chilenos-ganan-la-primera-hackathon-mundial-de-agentes-autonomos/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-base font-medium
                           bg-gradient-to-r from-orange-500 to-orange-600
                           hover:from-orange-600 hover:to-orange-700
                           transition-all duration-300 w-fit"
                >
                  {t.press.readArticle}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
