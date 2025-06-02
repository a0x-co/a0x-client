"use client";

import { createContext, useContext, useState } from "react";

type Language = "en" | "es";

interface Translations {
  hero: {
    title: string;
    subtitle: string;
    createButton: string;
    viewButton: string;
    createAgentMessage: string;
    buyA0x: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: {
      create: {
        title: string;
        description: string;
      };
      train: {
        title: string;
        description: string;
      };
      deploy: {
        title: string;
        description: string;
      };
    };
  };
  testimonials: {
    title: string;
    subtitle: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    plans: {
      basic: {
        name: string;
        description: string;
        features: string[];
        cta: string;
      };
      pro: {
        name: string;
        description: string;
        features: string[];
        cta: string;
      };
      enterprise: {
        name: string;
        description: string;
        features: string[];
        cta: string;
      };
    };
  };
  press: {
    title: string;
    subtitle: string;
    readMore: string;
    readArticle: string;
  };
  infrastructure: {
    title: string;
    subtitle: string;
    features: {
      security: {
        title: string;
        description: string;
      };
      scalability: {
        title: string;
        description: string;
      };
      reliability: {
        title: string;
        description: string;
      };
    };
  };
  features: {
    title: string;
    subtitle: string;
    trustedBy: string;
    cards: {
      automation: {
        title: string;
        description: string;
      };
      support: {
        title: string;
        description: string;
      };
      sales: {
        title: string;
        description: string;
      };
      social: {
        title: string;
        description: string;
      };
      analytics: {
        title: string;
        description: string;
      };
      security: {
        title: string;
        description: string;
      };
    };
  };
  cta: {
    title: string;
    button: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    hero: {
      title: "Create, customize, and\nengage with your AI agents",
      subtitle:
        "Automate tasks, engage with your audience, and scale your operations with intelligent AI assistants.",
      createButton: "Create Your Agent",
      viewButton: "View Agents",
      createAgentMessage: "Hello, I want to create an agent",
      buyA0x: "Buy $A0x",
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Create and deploy your AI workforce in minutes",
      steps: {
        create: {
          title: "Create Your Agent",
          description:
            "Design your AI agent with a unique personality and capabilities tailored to your needs.",
        },
        train: {
          title: "Train & Customize",
          description:
            "Train your agent with specific knowledge and customize its behavior patterns.",
        },
        deploy: {
          title: "Deploy & Scale",
          description:
            "Deploy your agent to work 24/7, handling tasks and scaling your operations automatically.",
        },
      },
    },
    testimonials: {
      title: "What Clients Say",
      subtitle: "Trusted by creators and businesses worldwide",
    },
    pricing: {
      title: "Simple Pricing",
      subtitle: "Choose the perfect plan for your needs",
      plans: {
        basic: {
          name: "Basic",
          description: "Perfect for getting started",
          features: [
            "1 AI Agent",
            "Basic customization",
            "Personality and Knowledge",
            "Perfect for customer support",
            "No-code tools",
            "Standard response time",
            "Community support",
          ],
          cta: "Start Free",
        },
        pro: {
          name: "Pro",
          description: "For growing creators",
          features: [
            "1 AI Agent",
            "Advanced customization",
            "Connect to CRM",
            "Priority response time",
            "Priority support",
            "Custom integrations",
            "Analytics dashboard",
          ],
          cta: "Get Started",
        },
        enterprise: {
          name: "Enterprise",
          description: "For large organizations",
          features: [
            "Unlimited AI Agents",
            "Full customization",
            "Instant response time",
            "24/7 dedicated support",
            "Custom development",
            "Advanced analytics",
            "SLA guarantee",
          ],
          cta: "Contact Us",
        },
      },
    },
    press: {
      title: "In the Press",
      subtitle: "See what others are saying about us",
      readMore: "Read More",
      readArticle: "Read Article",
    },
    infrastructure: {
      title: "Enterprise-Grade Infrastructure",
      subtitle: "Built for scale, security, and reliability",
      features: {
        security: {
          title: "Bank-Grade Security",
          description:
            "Enterprise-level encryption and security protocols to protect your data",
        },
        scalability: {
          title: "Infinite Scalability",
          description:
            "Infrastructure that grows with your needs, handling millions of interactions",
        },
        reliability: {
          title: "99.99% Uptime",
          description:
            "Highly available infrastructure with redundancy across multiple regions",
        },
      },
    },
    features: {
      title: "Revolutionize Your Business",
      subtitle:
        "Transform your operations with intelligent AI agents that handle everything from customer support to sales automation",
      trustedBy: "Trusted by Industry Leaders",
      cards: {
        automation: {
          title: "AI-Powered Automation",
          description:
            "Automate repetitive tasks and workflows with intelligent AI agents that learn and adapt to your business needs.",
        },
        support: {
          title: "24/7 Customer Support",
          description:
            "Provide instant customer support around the clock with AI agents that understand and respond to customer inquiries naturally.",
        },
        sales: {
          title: "Sales Operations",
          description:
            "Streamline your sales process with AI agents that qualify leads, schedule meetings, and follow up with prospects automatically.",
        },
        social: {
          title: "Social Media Management",
          description:
            "Engage with your audience across platforms through AI agents that create, schedule, and manage social media content.",
        },
        analytics: {
          title: "Performance Analytics",
          description:
            "Track and optimize your AI agents' performance with detailed analytics and insights for continuous improvement.",
        },
        security: {
          title: "Enterprise Security",
          description:
            "Deploy AI agents with enterprise-grade security and compliance measures to protect your business data.",
        },
      },
    },
    cta: {
      title: "Ready to transform\nyour business with AI?",
      button: "Start Building Now",
    },
  },
  es: {
    hero: {
      title: "Crea, personaliza e\ninteractúa con tus agentes IA",
      subtitle:
        "Automatiza tareas, interactúa con tu audiencia y escala tus operaciones con asistentes IA inteligentes.",
      createButton: "Crea tu Agente",
      viewButton: "Ver Agentes",
      createAgentMessage: "Hola, quiero crear un agente",
      buyA0x: "Comprar $A0x",
    },
    howItWorks: {
      title: "Cómo Funciona",
      subtitle: "Crea y despliega tu fuerza laboral IA en minutos",
      steps: {
        create: {
          title: "Crea tu Agente",
          description:
            "Diseña tu agente IA con una personalidad única y capacidades adaptadas a tus necesidades.",
        },
        train: {
          title: "Entrena y Personaliza",
          description:
            "Entrena a tu agente con conocimientos específicos y personaliza sus patrones de comportamiento.",
        },
        deploy: {
          title: "Despliega y Escala",
          description:
            "Despliega tu agente para trabajar 24/7, manejando tareas y escalando tus operaciones automáticamente.",
        },
      },
    },
    testimonials: {
      title: "Qué Dicen los Clientes",
      subtitle: "Confiado por creadores y empresas en todo el mundo",
    },
    pricing: {
      title: "Precios Simples",
      subtitle: "Elige el plan perfecto para tus necesidades",
      plans: {
        basic: {
          name: "Básico",
          description: "Perfecto para comenzar",
          features: [
            "1 Agente IA",
            "Personalización básica",
            "Personalidad y Conocimiento",
            "Perfecto para atención al cliente",
            "Herramientas sin código",
            "Tiempo de respuesta estándar",
            "Soporte comunitario",
          ],
          cta: "Comenzar Gratis",
        },
        pro: {
          name: "Pro",
          description: "Para creadores en crecimiento",
          features: [
            "1 Agente de IA",
            "Personalización avanzada",
            "Conexión con CRM",
            "Tiempo de respuesta prioritario",
            "Soporte prioritario",
            "Integraciones personalizadas",
            "Panel de análisis",
          ],
          cta: "Comenzar",
        },
        enterprise: {
          name: "Empresa",
          description: "Para grandes organizaciones",
          features: [
            "Agentes IA ilimitados",
            "Personalización completa",
            "Tiempo de respuesta instantáneo",
            "Soporte 24/7 dedicado",
            "Desarrollo personalizado",
            "Análisis avanzado",
            "Garantía de SLA",
          ],
          cta: "Contáctanos",
        },
      },
    },
    press: {
      title: "En la Prensa",
      subtitle: "Mira lo que otros dicen sobre nosotros",
      readMore: "Leer Más",
      readArticle: "Leer Artículo",
    },
    infrastructure: {
      title: "Infraestructura de Nivel Empresarial",
      subtitle: "Construido para escala, seguridad y confiabilidad",
      features: {
        security: {
          title: "Seguridad Bancaria",
          description:
            "Encriptación y protocolos de seguridad de nivel empresarial para proteger tus datos",
        },
        scalability: {
          title: "Escalabilidad Infinita",
          description:
            "Infraestructura que crece con tus necesidades, manejando millones de interacciones",
        },
        reliability: {
          title: "99.99% de Disponibilidad",
          description:
            "Infraestructura altamente disponible con redundancia en múltiples regiones",
        },
      },
    },
    features: {
      title: "Revoluciona tu Negocio",
      subtitle:
        "Transforma tus operaciones con agentes de IA inteligentes que manejan todo, desde atención al cliente hasta automatización de ventas",
      trustedBy: "Respaldado por Líderes de la Industria",
      cards: {
        automation: {
          title: "Automatización con IA",
          description:
            "Automatiza tareas repetitivas y flujos de trabajo con agentes de IA inteligentes que aprenden y se adaptan a las necesidades de tu negocio.",
        },
        support: {
          title: "Soporte 24/7",
          description:
            "Proporciona soporte instantáneo las 24 horas con agentes de IA que entienden y responden a las consultas de los clientes de forma natural.",
        },
        sales: {
          title: "Operaciones de Ventas",
          description:
            "Optimiza tu proceso de ventas con agentes de IA que califican leads, programan reuniones y hacen seguimiento a prospectos automáticamente.",
        },
        social: {
          title: "Gestión de Redes Sociales",
          description:
            "Interactúa con tu audiencia en todas las plataformas a través de agentes de IA que crean, programan y gestionan contenido en redes sociales.",
        },
        analytics: {
          title: "Análisis de Rendimiento",
          description:
            "Rastrea y optimiza el rendimiento de tus agentes de IA con análisis detallados e insights para la mejora continua.",
        },
        security: {
          title: "Seguridad Empresarial",
          description:
            "Implementa agentes de IA con medidas de seguridad y cumplimiento de nivel empresarial para proteger los datos de tu negocio.",
        },
      },
    },
    cta: {
      title: "¿Listo para transformar\ntu negocio con IA?",
      button: "Comienza a Construir Ahora",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
