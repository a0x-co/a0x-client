"use client";

// next
import Script from "next/script";

// react
import { useEffect, useRef } from "react";

// spline
import Spline from "@splinetool/react-spline/next";

export const Model3D = () => {
  const hasDetectedLogo = useRef(false);
  useEffect(() => {
    console.log("Starting interval check");

    if (hasDetectedLogo.current) {
      return;
    }

    const intervalId = setInterval(() => {
      console.log("Checking for logo...");
      const splineViewer = document.querySelector("spline-viewer");

      if (splineViewer && splineViewer.shadowRoot) {
        const logoElement = splineViewer.shadowRoot.querySelector("a#logo");
        console.log("Spline Viewer:", splineViewer);
        console.log("Logo Element:", logoElement);

        if (logoElement) {
          console.log("Found logo element, removing it");
          logoElement.remove();
          clearInterval(intervalId);
          hasDetectedLogo.current = true;
          console.log("Interval cleared");
        }
      }
    }, 1000);

    return () => {
      console.log("Cleaning up interval");
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-10 max-md:h-[50vh] max-xl:h-[70vh] max-xl:mt-auto pointer-events-auto banner-container">
      {/* <Script
        type="module"
        src="https://unpkg.com/@splinetool/viewer@1.9.62/build/spline-viewer.js"
        strategy="afterInteractive"
      /> */}
      <Spline
        scene="https://prod.spline.design/gxuC7cO09ZdBrVQh/scene.splinecode"
        onLoad={(spline) => {
          const white = 0;
          const black = 100;
          // const intervalId = setInterval(() => {
          //   console.log("Set Variable...");
          //   spline.setVariables({
          //     white: white,
          //     black: black,

          //   });
          //   white += 10;
          //   black -= 10;

          //   if (white > 100) {
          //     white = 0;
          //     black = 100;
          //   }
          // }, 5000);
          setTimeout(() => {
            console.log("Set Variable...");
            spline.setVariables({
              white: white,
              black: black,
            });
          }, 5000);

          // Guardar el ID del intervalo en una referencia para limpiarlo después
          // return () => clearInterval(intervalId);
        }}
      />
    </div>
  );
};
