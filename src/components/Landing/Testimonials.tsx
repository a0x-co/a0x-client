"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const Testimonials = () => {
  const { t } = useLanguage();
  
  const testimonials = [
    {
      name: "Pedro Iñiguez",
      role: "Founder @Kamaleont.io",
      image: "/assets/images/clients/pedro.png",
      quote: "Best developers I've ever worked with, anything is possible for them, they work fast and deliver high quality results.",
      gradient: "from-blue-50 via-purple-50 to-blue-50",
      link: "https://www.linkedin.com/in/pedro-i%C3%B1iguez-laso-0967a91b2/",
    },
    {
      name: "Nader Dabit",
      role: "DevRel Director @Eigenlayer",
      image: "/assets/images/clients/nader.png",
      quote: "Wav3s by @A0X is a revolutionary product, simple, easy and effective.",
      gradient: "from-purple-50 via-pink-50 to-purple-50",
      link: "https://x.com/dabit3",
    },
    {
      name: "Daniel Guerra",
      role: "Chief of Product @CYC",
      image: "/assets/images/clients/daniel.png",
      quote: "High quality work, fast execution and a great price, I recommend them for any project.",
      gradient: "from-pink-50 via-rose-50 to-pink-50",
      link: "https://www.linkedin.com/in/daniel-guerra-arismendi-79b32223/",
    },
  ];

  return (
    <section className="py-24 relative bg-gray-900">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-90" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl font-bold text-white mb-4">
            {t.testimonials.title}
          </h2>
          <p className="text-2xl md:text-3xl text-gray-300 sm:px-6 lg:px-8">
            {t.testimonials.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-white/10 
                        hover:border-cyan-500/30 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-cyan-500/20" />
              <div className="flex items-center mb-6">
                <a 
                  href={testimonial.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  <div className="relative w-14 h-14 rounded-full overflow-hidden mr-4 ring-2 ring-cyan-500/20">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{testimonial.name}</h3>
                    <p className="text-gray-400">{testimonial.role}</p>
                  </div>
                </a>
              </div>
              <p className="text-gray-300 italic leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 