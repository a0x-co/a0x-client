"use client";

import { motion } from "framer-motion";
import { Shield, Scale, Server } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const Infrastructure = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Shield,
      ...t.infrastructure.features.security,
      gradient: "bg-[#EEF1FF]",
      iconColor: "text-[#6C7CFF]",
      iconBg: "bg-[#DDE2FF]",
    },
    {
      icon: Scale,
      ...t.infrastructure.features.scalability,
      gradient: "bg-[#FCF1FF]",
      iconColor: "text-[#C27FFF]",
      iconBg: "bg-[#F5E0FF]",
    },
    {
      icon: Server,
      ...t.infrastructure.features.reliability,
      gradient: "bg-[#FFF1F5]",
      iconColor: "text-[#FF7FAD]",
      iconBg: "bg-[#FFE0EA]",
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
          <h2 className="text-4xl font-bold text-[#6C7CFF] mb-4">
            {t.infrastructure.title}
          </h2>
          <p className="text-gray-500 text-lg">
            {t.infrastructure.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`p-8 rounded-[32px] ${feature.gradient}
                         hover:scale-[1.02] transition-transform duration-300 ease-out`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6`}>
                <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 