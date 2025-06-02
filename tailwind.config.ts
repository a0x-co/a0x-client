import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          primary: "#121212",
          border: "#3f3f3f",
        },
      },
      backgroundSize: {
        "size-200": "200% 200%",
      },
      backgroundPosition: {
        "pos-0": "0% 0%",
        "pos-100": "100% 100%",
      },
      keyframes: {
        fadeInOut: {
          "0%": { opacity: "0", transform: "translateY(-100px)" },
          "50%": { opacity: "1", transform: "translateY(0px)" },
          "100%": { opacity: "0", transform: "translateY(-100px)" },
        },
        visible: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "rotate-soft": {
          "0%, 70%, 100%": {
            transform: "rotate(0deg)",
          },
          "20%": {
            transform: "rotate(10deg)",
          },
          "40%": {
            transform: "rotate(-10deg)",
          },
        },
      },
      animation: {
        fadeInOut: "fadeInOut 5s ease-in-out infinite",
        visible: "visible 7.5s ease-in forwards",
        bounce: "bounce 1s infinite",
        "rotate-soft": "rotate-soft 1.5s ease-in-out infinite",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      height: {
        screen: "100vh",
      },
      zIndex: {
        "-1": "-1",
      },
      transitionProperty: {
        opacity: "opacity",
      },
      mixBlendMode: {
        normal: "normal",
        multiply: "multiply",
        screen: "screen",
        overlay: "overlay",
        darken: "darken",
        lighten: "lighten",
        color: "color",
        "color-dodge": "color-dodge",
        "color-burn": "color-burn",
        "hard-light": "hard-light",
        "soft-light": "soft-light",
        difference: "difference",
        exclusion: "exclusion",
        hue: "hue",
        saturation: "saturation",
        luminosity: "luminosity",
      },
    },
    container: {
      center: true,
      padding: "1rem",
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "animate-delay": (value) => ({
            animationDelay: value,
          }),
        },
        { values: theme("transitionDelay") }
      );
    }),
  ],
};

export default config;
