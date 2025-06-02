"use client";

import { useEffect, useRef } from "react";

export const DotsAnimation = () => {
  const dotAnimation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const element = dotAnimation.current;
      if (element) {
        // Reinicia la animación removiendo y volviendo a agregar la clase
        element.classList.remove("dot-animation");
        void element.offsetWidth; // Forzar reflujo para reiniciar la animación
        element.classList.add("dot-animation");
      }
    }, 10000); // Reinicia cada 10 segundos

    return () => clearInterval(interval); // Limpia el intervalo al desmontar
  }, []);

  return (
    <div>
      <div ref={dotAnimation} className="dot-animation">
        <span>.</span>
        <span className="dot-2">.</span>
        <span className="dot-3">.</span>
      </div>
      <style jsx>{`
        .dot-animation span {
          opacity: 0;
          animation: dot-blink 1s infinite;
        }
        .dot-animation .dot-2 {
          animation-delay: 0.3s;
        }
        .dot-animation .dot-3 {
          animation-delay: 0.6s;
        }
        @keyframes dot-blink {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
