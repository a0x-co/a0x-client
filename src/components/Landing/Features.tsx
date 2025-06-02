"use client";

import { motion, useAnimationControls } from "framer-motion";
import {
  Bot,
  MessageSquare,
  Users,
  Zap,
  BarChart,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";

export const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Bot,
      title: t.features.cards.automation.title,
      description: t.features.cards.automation.description,
      gradient: "from-[#EEF1FF] to-white",
      iconColor: "text-[#6C7CFF]",
      keywords:
        "automation, AI automation, workflow automation, business automation",
    },
    {
      icon: MessageSquare,
      title: t.features.cards.support.title,
      description: t.features.cards.support.description,
      gradient: "from-[#FCF1FF] to-white",
      iconColor: "text-[#C27FFF]",
      keywords:
        "customer support automation, AI customer service, 24/7 support",
    },
    {
      icon: Users,
      title: t.features.cards.sales.title,
      description: t.features.cards.sales.description,
      gradient: "from-[#FFF1F5] to-white",
      iconColor: "text-[#FF7FAD]",
      keywords: "sales automation, lead generation, sales operations",
    },
    {
      icon: Zap,
      title: t.features.cards.social.title,
      description: t.features.cards.social.description,
      gradient: "from-[#EEF1FF] to-white",
      iconColor: "text-[#6C7CFF]",
      keywords:
        "social media automation, content management, audience engagement",
    },
    {
      icon: BarChart,
      title: t.features.cards.analytics.title,
      description: t.features.cards.analytics.description,
      gradient: "from-[#FCF1FF] to-white",
      iconColor: "text-[#C27FFF]",
      keywords: "analytics, performance tracking, business intelligence",
    },
    {
      icon: ShieldCheck,
      title: t.features.cards.security.title,
      description: t.features.cards.security.description,
      gradient: "from-[#FFF1F5] to-white",
      iconColor: "text-[#FF7FAD]",
      keywords: "security, compliance, enterprise solutions",
    },
  ];

  return (
    <section className="relative py-32 bg-gray-900">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-90" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.h2 className="text-6xl font-bold text-white text-center mb-8">
          <span className="font-mono text-cyan-400">{"<"}</span>
          {t.features.title}
          <span className="font-mono text-cyan-400">{"/>"}</span>
        </motion.h2>

        <motion.p
          className="text-2xl text-gray-400 max-w-3xl mx-auto text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {t.features.subtitle}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-white/10 hover:border-cyan-500/30 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <feature.icon className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Partners carousel section */}
        <motion.div
          className="mt-48 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-6xl font-semibold text-white mb-40">
            {t.features.trustedBy}
          </h3>
          <div className="relative overflow-hidden w-[100vw] left-[calc(-50vw+50%)]">
            <motion.div
              className="flex gap-32 items-center"
              style={{
                position: "relative",
                width: "max-content",
                transform: "translateX(0)",
              }}
              animate={{
                x: ["0%", "-50%"],
                transition: {
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30,
                    ease: "linear",
                  },
                },
              }}
              initial={{ x: "0%" }}
            >
              <Link
                href="https://clpd.a0x.co"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/clpd.png"
                  alt="CLPD"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://kamaleont.io"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/kamaleont_logo.jpeg"
                  alt="Kamaleont"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://app.promeridu.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/promeridu.png"
                  alt="Promeridu"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://wav3s.app"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/wav3s.png"
                  alt="Wav3s"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://zurf.social/"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/zurflogo.webp"
                  alt="Zurf"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://urku.vercel.app/es"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/urku.png"
                  alt="URKU"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://vibra.so"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/vibra_logo.png"
                  alt="Vibra"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://billi.live"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/billi.png"
                  alt="Billi.live"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>

              {/* Duplicate set for seamless loop */}
              <Link
                href="https://clpd.a0x.co"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/clpd.png"
                  alt="CLPD"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://kamaleont.io"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/kamaleont_logo.jpeg"
                  alt="Kamaleont"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://app.promeridu.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/promeridu.png"
                  alt="Promeridu"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://wav3s.app"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/wav3s.png"
                  alt="Wav3s"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://zurf.social/"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/zurflogo.webp"
                  alt="Zurf"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://urku.vercel.app/es"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/urku.png"
                  alt="URKU"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://vibra.so"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/vibra_logo.png"
                  alt="Vibra"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
              <Link
                href="https://billi.live"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Image
                  src="/assets/images/partners/billi.png"
                  alt="Billi.live"
                  className="h-20 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                  width={80}
                  height={80}
                />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Additional SEO content */}
        <div className="sr-only">
          <h2>AI Agent Platform for Business Automation</h2>
          <p>
            A0X provides cutting-edge AI automation solutions for businesses
            looking to streamline their operations. Our platform offers
            AI-powered agents for customer service automation, sales process
            automation, social media management, and business workflow
            automation. Perfect for startups, enterprises, and businesses
            looking to scale their operations with artificial intelligence.
          </p>
          <ul>
            <li>Automated customer support with AI</li>
            <li>Sales automation and lead generation</li>
            <li>Social media automation and management</li>
            <li>Business process automation</li>
            <li>Enterprise AI solutions</li>
            <li>Workflow automation platform</li>
            <li>AI agents for business</li>
            <li>Chatbot automation</li>
            <li>Customer service AI</li>
            <li>Sales operations automation</li>
          </ul>
        </div>
      </div>
    </section>
  );
};
