"use client";

import React, { useEffect, useRef } from "react";
import "./ParticleEffect.css";

interface ParticleEffectProps {
  count?: number;
  active?: boolean;
  className?: string;
  color?: string;
  type?: "star" | "circle";
  glowColor?: string;
  size?: number;
  scaleAnimation?: boolean;
  minScale?: number;
  maxScale?: number;
  animation?: "rotate" | "spiral";
  speed?: number;
  tilt?: number;
  spiralWidth?: number;
  spiralHeight?: number;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({
  count = 20,
  active = true,
  className = "",
  color = "white",
  type = "star",
  glowColor = "rgba(255, 255, 255, 0.6)",
  size = 1,
  scaleAnimation = true,
  minScale = 0.85,
  maxScale = 1.15,
  animation = "rotate",
  speed = 1,
  tilt = 30,
  spiralWidth = 0.5,
  spiralHeight = 0.7,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    // Función para establecer aleatoriedad para las partículas
    const setRandomParticleStyles = () => {
      const particles = document.querySelectorAll(".particle-effect .particle");
      particlesRef.current = Array.from(particles) as HTMLElement[];

      particles.forEach((particle, index) => {
        const randomX = Math.floor(Math.random() * (80 - 20 + 1) + 20);
        const randomY = Math.floor(Math.random() * (80 - 20 + 1) + 20);
        const randomDuration = Math.floor(Math.random() * (20 - 6 + 1) + 6);
        const randomDelay = Math.floor(Math.random() * (10 - 1 + 1) + 1);
        const randomAlpha =
          Math.floor(Math.random() * (90 - 40 + 1) + 40) / 100;
        const randomOriginX =
          Math.random() > 0.5
            ? Math.floor(Math.random() * (800 - 300 + 1) + 300) * -1
            : Math.floor(Math.random() * (800 - 300 + 1) + 300);
        const randomOriginY =
          Math.random() > 0.5
            ? Math.floor(Math.random() * (800 - 300 + 1) + 300) * -1
            : Math.floor(Math.random() * (800 - 300 + 1) + 300);
        const randomSize =
          (Math.floor(Math.random() * (90 - 40 + 1) + 40) / 100) * size;

        // Valores aleatorios para la animación de escala
        const randomScaleDuration = Math.floor(Math.random() * (5 - 2 + 1) + 2);
        const randomScaleDelay = Math.floor(Math.random() * (5 - 1 + 1) + 1);

        // Para la animación de espiral, asignamos posiciones iniciales
        if (animation === "spiral") {
          // Distribuir las partículas uniformemente a lo largo de la espiral
          const angle = (index / count) * Math.PI * 8; // 4 vueltas completas
          const particleSpeed = (Math.random() * 0.5 + 0.75) * speed;

          (particle as HTMLElement).dataset.angle = angle.toString();
          (particle as HTMLElement).dataset.speed = particleSpeed.toString();
          (particle as HTMLElement).dataset.radius = (
            Math.random() * 10 +
            20
          ).toString();
          (particle as HTMLElement).dataset.height = (
            Math.random() * 2 -
            1
          ).toString(); // Posición vertical relativa
        } else {
          // Configuración para la animación de rotación estándar
          (particle as HTMLElement).style.setProperty("--x", `${randomX}`);
          (particle as HTMLElement).style.setProperty("--y", `${randomY}`);
          (particle as HTMLElement).style.setProperty(
            "--duration",
            `${randomDuration}`
          );
          (particle as HTMLElement).style.setProperty(
            "--delay",
            `${randomDelay}`
          );
          (particle as HTMLElement).style.setProperty(
            "--origin-x",
            `${randomOriginX}%`
          );
          (particle as HTMLElement).style.setProperty(
            "--origin-y",
            `${randomOriginY}%`
          );
        }

        // Propiedades comunes para ambas animaciones
        (particle as HTMLElement).style.setProperty(
          "--alpha",
          `${randomAlpha}`
        );
        (particle as HTMLElement).style.setProperty("--size", `${randomSize}`);
        (particle as HTMLElement).style.setProperty(
          "--min-scale",
          `${minScale}`
        );
        (particle as HTMLElement).style.setProperty(
          "--max-scale",
          `${maxScale}`
        );
        (particle as HTMLElement).style.setProperty(
          "--scale-duration",
          `${randomScaleDuration}`
        );
        (particle as HTMLElement).style.setProperty(
          "--scale-delay",
          `${randomScaleDelay}`
        );
      });
    };

    setRandomParticleStyles();

    // Iniciar la animación de espiral si es necesario
    if (animation === "spiral" && active) {
      startSpiralAnimation();
    }

    return () => {
      // Limpiar la animación al desmontar
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    count,
    size,
    minScale,
    maxScale,
    animation,
    active,
    speed,
    tilt,
    spiralWidth,
    spiralHeight,
  ]);

  // Función para animar las partículas en una trayectoria de espiral vertical
  const startSpiralAnimation = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // Convertir la inclinación de grados a radianes
    const tiltRad = (tilt * Math.PI) / 180;

    // Calcular dimensiones de la espiral
    const spiralWidthPx = containerWidth * spiralWidth;
    const spiralHeightPx = containerHeight * spiralHeight;

    // Función para actualizar la posición de cada partícula
    const updateParticles = () => {
      particlesRef.current.forEach((particle) => {
        // Obtener los valores almacenados en los atributos data
        let angle = parseFloat(particle.dataset.angle || "0");
        const speed = parseFloat(particle.dataset.speed || "1");
        const radius = parseFloat(particle.dataset.radius || "30");
        let height = parseFloat(particle.dataset.height || "0");

        // Incrementar el ángulo según la velocidad
        angle += 0.01 * speed;
        if (angle > Math.PI * 8) angle = 0; // Reiniciar después de 4 vueltas

        // Actualizar la altura (movimiento vertical)
        height += 0.005 * speed;
        if (height > 1) height = -1; // Reiniciar cuando llega arriba

        // Guardar los nuevos valores
        particle.dataset.angle = angle.toString();
        particle.dataset.height = height.toString();

        // Calcular la posición en la espiral
        // Usamos spiralWidthPx/2 como radio máximo horizontal
        const spiralRadius = (spiralWidthPx / 2) * (1 - Math.abs(height) * 0.3); // El radio se reduce ligeramente en los extremos
        const x = Math.cos(angle) * spiralRadius;
        // Usamos spiralHeightPx/2 como altura máxima vertical
        const y = height * (spiralHeightPx / 2);
        const z = Math.sin(angle) * spiralRadius;

        // Aplicar la inclinación (rotación alrededor del eje X)
        const tiltedY = y * Math.cos(tiltRad) - z * Math.sin(tiltRad);
        const tiltedZ = y * Math.sin(tiltRad) + z * Math.cos(tiltRad);

        // Proyectar coordenadas 3D a 2D con perspectiva simple
        const scale = 300 / (300 + tiltedZ); // Factor de escala basado en la profundidad
        const projectedX = centerX + x * scale;
        const projectedY = centerY + tiltedY * scale;

        // Aplicar la posición y escala a la partícula
        particle.style.left = `${projectedX}px`;
        particle.style.top = `${projectedY}px`;

        // Escala basada en la profundidad y la animación de escala
        const pulseScale = 1 + Math.sin(angle * 3) * 0.1;
        particle.style.transform = `scale(${scale * pulseScale})`;

        // Ajustar la opacidad basada en la posición z para dar sensación de profundidad
        const opacity = 0.4 + ((tiltedZ + radius) / (radius * 2)) * 0.6;
        particle.style.opacity = opacity.toString();

        // Ajustar el z-index basado en la coordenada z
        particle.style.zIndex = Math.floor(tiltedZ + 100).toString();
      });

      // Continuar la animación
      animationRef.current = requestAnimationFrame(updateParticles);
    };

    // Iniciar el bucle de animación
    updateParticles();
  };

  const renderParticle = (index: number) => {
    const particleClass = `particle ${
      scaleAnimation && animation !== "spiral" ? "scale-animate" : ""
    } ${animation === "spiral" ? "spiral-particle" : ""}`;

    if (type === "circle") {
      return (
        <div
          key={index}
          className={`${particleClass} circle-particle`}
          style={{
            backgroundColor: color,
            boxShadow: `0 0 10px 2px ${glowColor}`,
          }}
        >
          <div
            className="circle-shadow"
            style={{
              backgroundColor: glowColor,
            }}
          ></div>
        </div>
      );
    }

    // Default star shape
    return (
      <svg
        key={index}
        className={particleClass}
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
          fill={color}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`particle-effect ${className} ${
        animation === "spiral" ? "spiral-container" : ""
      }`}
      style={{ "--active": active ? "1" : "0" } as React.CSSProperties}
    >
      <span aria-hidden="true" className="particle-container">
        {[...Array(count)].map((_, index) => renderParticle(index))}
      </span>
    </div>
  );
};

export default ParticleEffect;
