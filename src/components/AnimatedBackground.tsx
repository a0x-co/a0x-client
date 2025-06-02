interface AnimatedBackgroundProps {
  isDark?: boolean;
}

export function AnimatedBackground({ isDark = true }: AnimatedBackgroundProps) {
  const baseColor = isDark ? "#000" : "#fff";
  const gradientColors = isDark
    ? ["#ffffff", "#e0e0e0", "#c0c0c0", "#a0a0a0"]
    : ["#000000", "#202020", "#404040", "#606060"];

  return (
    <>
      <style jsx>{`
        .animated-bg {
          position: absolute;
          inset: 0em;
          --c: 7px;
          background-color: ${baseColor};
          background-image: radial-gradient(
              circle at 50% 50%,
              #0000 1.5px,
              ${baseColor} 0 var(--c),
              #0000 var(--c)
            ),
            radial-gradient(
              circle at 50% 50%,
              #0000 1.5px,
              ${baseColor} 0 var(--c),
              #0000 var(--c)
            ),
            radial-gradient(
              circle at 50% 50%,
              ${gradientColors[0]},
              ${gradientColors[0]}00 60%
            ),
            radial-gradient(
              circle at 50% 50%,
              ${gradientColors[1]},
              ${gradientColors[1]}00 60%
            ),
            radial-gradient(
              circle at 50% 50%,
              ${gradientColors[2]},
              ${gradientColors[2]}00 60%
            ),
            radial-gradient(
              ellipse at 50% 50%,
              ${gradientColors[3]},
              ${gradientColors[3]}00 60%
            );
          background-size: 12px 20.7846097px, 12px 20.7846097px, 200% 200%,
            200% 200%, 200% 200%, 200% 20.7846097px;
          --p: 0px 0px, 6px 10.39230485px;
          background-position: var(--p), 0% 0%, 0% 0%, 0% 0px;
          animation: wee 40s linear infinite, filt 6s linear infinite;
        }

        @keyframes filt {
          0% {
            filter: hue-rotate(0deg);
          }
          to {
            filter: hue-rotate(360deg);
          }
        }

        @keyframes wee {
          0% {
            background-position: var(--p), 800% 400%, 1000% -400%, -1200% -600%,
              400% 41.5692194px;
          }
          to {
            background-position: var(--p), 0% 0%, 0% 0%, 0% 0%, 0% 0%;
          }
        }
      `}</style>
      <div className="animated-bg absolute min-h-screen w-screen pointer-events-none"></div>
    </>
  );
}
