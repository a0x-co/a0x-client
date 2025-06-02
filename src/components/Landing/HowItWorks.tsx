"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const HowItWorks = () => {
  const { t } = useLanguage();
  
  const steps = [
    {
      icon: Bot,
      title: t.howItWorks.steps.create.title,
      description: t.howItWorks.steps.create.description,
      gradient: "from-blue-50 to-purple-50",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      icon: Sparkles,
      title: t.howItWorks.steps.train.title,
      description: t.howItWorks.steps.train.description,
      gradient: "from-purple-50 to-pink-50",
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
    },
    {
      icon: Zap,
      title: t.howItWorks.steps.deploy.title,
      description: t.howItWorks.steps.deploy.description,
      gradient: "from-pink-50 to-rose-50",
      iconColor: "text-pink-600",
      iconBg: "bg-pink-50",
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl font-bold text-black mb-4">
            {t.howItWorks.title}
          </h2>
          <p className="text-2xl md:text-3xl text-gray-600 sm:px-6 lg:px-8">
            {t.howItWorks.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`p-8 rounded-2xl bg-gradient-to-br ${step.gradient} border border-black/5
                         hover:scale-105 transition-transform duration-300 ease-out
                         shadow-lg shadow-black/5 hover:shadow-black/10`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className={`w-14 h-14 rounded-2xl ${step.iconBg} flex items-center justify-center mb-6 
                             shadow-lg shadow-black/5`}>
                <step.icon className={`w-7 h-7 ${step.iconColor}`} />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 