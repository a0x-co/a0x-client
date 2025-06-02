"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "es" : "en")}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 
                 border border-white/10 hover:border-white/20 transition-all duration-200"
    >
      <Globe className="w-4 h-4 text-gray-400" />
      <span className="text-sm font-medium text-gray-300">
        {language === "en" ? "ES" : "EN"}
      </span>
    </button>
  );
}; 