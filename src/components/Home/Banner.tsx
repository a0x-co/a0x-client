import React, { useEffect } from "react";

import Script from "next/script";

import "./Banner.css";

interface SplineViewerElement extends HTMLElement {
  url: string;
  load: () => Promise<void>;
}

declare global {
  interface HTMLElementTagNameMap {
    "spline-viewer": SplineViewerElement;
  }
}

const Banner: React.FC = () => {
  useEffect(() => {
    console.log("Starting interval check");

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
    <section className="isolate relative h-screen w-screen bg-transparent pointer-events-none banner-container">
      <div className="absolute inset-0 max-md:bottom-0 max-md:left-1/2 max-md:transform max-md:-translate-x-1/2 max-md:w-full">
        <div className="absolute inset-0 z-10 max-md:h-[50vh] max-xl:h-[70vh] max-xl:mt-auto pointer-events-auto">
          <Script
            type="module"
            src="https://unpkg.com/@splinetool/viewer@1.9.62/build/spline-viewer.js"
            strategy="afterInteractive"
          />
          <spline-viewer url="https://prod.spline.design/AqtlWJlNbO-ZMkvz/scene.splinecode"></spline-viewer>
          {/* <spline-viewer url="https://prod.spline.design/gxuC7cO09ZdBrVQh/scene.splinecode"></spline-viewer> */}
        </div>

        <div className="overlay absolute max-md:inset-0 max-md:h-full inset-0 bg-black opacity-25 mix-blend-normal z-0"></div>
        <div className="container mx-auto h-full flex items-center justify-center">
          <div className="text-center relative z-20 mix-blend-exclusion pointer-events-none w-full">
            <div className="scene">
              <div className="cube">
                <div className="cube-face front">
                  <h1 className="text-2xl md:text-4xl xl:text-8xl font-bold leading-tight text-white uppercase">
                    {/* create ur agent / put him to work / get paid for your agent's work / hire agents that work for you */}
                    Create <br /> Ur Agent
                  </h1>
                </div>
                <div className="cube-face top">
                  <h1 className="text-2xl md:text-4xl xl:text-8xl font-bold leading-tight text-white uppercase">
                    Put Him <br /> To Work
                  </h1>
                </div>
                <div className="cube-face bottom">
                  <h1 className="text-2xl md:text-4xl xl:text-8xl font-bold leading-tight text-white uppercase">
                    Get Paid
                    <br /> For <br />
                    Your Agent
                  </h1>
                </div>
              </div>
            </div>{" "}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
