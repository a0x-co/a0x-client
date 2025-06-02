"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useChatSheet } from "@/context/ChatSheetContext";

export const Pricing = () => {
  const { t } = useLanguage();

  const plans = [
    {
      name: t.pricing.plans.basic.name,
      price: "Free",
      description: t.pricing.plans.basic.description,
      features: t.pricing.plans.basic.features,
      cta: t.pricing.plans.basic.cta,
      href: "/create-agent",
      featured: false,
      gradient: "from-blue-50 via-indigo-50 to-blue-50",
    },
    {
      name: t.pricing.plans.pro.name,
      price: "$49",
      period: "/month",
      description: t.pricing.plans.pro.description,
      features: t.pricing.plans.pro.features,
      cta: t.pricing.plans.pro.cta,
      href: "mailto:daniel@a0x.co?subject=A0X Pro Plan Inquiry",
      featured: true,
      gradient: "from-purple-50 via-pink-50 to-purple-50",
    },
    {
      name: t.pricing.plans.enterprise.name,
      price: "Custom",
      description: t.pricing.plans.enterprise.description,
      features: t.pricing.plans.enterprise.features,
      cta: t.pricing.plans.enterprise.cta,
      href: "mailto:daniel@a0x.co?subject=A0X Enterprise Plan Inquiry",
      featured: false,
      gradient: "from-pink-50 via-rose-50 to-pink-50",
    },
  ];
  const { setTrigger, setIsOpen } = useChatSheet();

  const handleCreateAgent = () => {
    setTrigger("create_agent");
    setIsOpen(true);
  };

  return (
    <section className="py-0 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl font-bold text-black mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-2xl md:text-3xl text-gray-600 sm:px-6 lg:px-8">
            {t.pricing.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`p-8 rounded-2xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 ease-out ${
                plan.featured
                  ? "bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-100 shadow-xl shadow-purple-100/20"
                  : `bg-gradient-to-br ${plan.gradient} border border-black/5 shadow-lg shadow-black/5`
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <h3 className="text-2xl font-bold text-black mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-black">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                )}
              </div>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center text-gray-600"
                  >
                    <Check
                      className={`w-5 h-5 mr-2 ${
                        plan.featured ? "text-purple-600" : "text-blue-600"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (
                    plan.name === t.pricing.plans.basic.name ||
                    plan.name === t.pricing.plans.pro.name
                  ) {
                    handleCreateAgent();
                  } else {
                    window.open(plan.href, "_blank");
                  }
                }}
                className={`block w-full py-3 px-6 rounded-xl text-center font-medium transition-all duration-300 ${
                  plan.featured
                    ? "bg-black text-white hover:bg-black/90 shadow-lg shadow-black/5 hover:shadow-black/10"
                    : "bg-white text-black border border-black/10 hover:border-black/20 shadow-lg shadow-black/5 hover:shadow-black/10"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
