"use client";

import React from "react";
import Spline from "@splinetool/react-spline/next";

const MiniAgent: React.FC = () => {
  return (
    <>
      <SpotlightBackground />
      <Spline
        className="absolute inset-0 z-10"
        scene="https://prod.spline.design/LRAuJGn4hSCPTuxT/scene.splinecode"
      />
    </>
  );
};

const SpotlightBackground: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full">
      <div
        className="absolute inset-0 bg-[#e6e6e6]"
        style={{
          background: `radial-gradient(circle at center, 
            #ffffff 0%, 
            #f5f5f5 25%, 
            #e6e6e6 50%, 
            #d9d9d9 75%, 
            #cccccc 100%)`,
        }}
      />

      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4_elegant_BW_spotlight_background.jpg-HKxxl4xF0HxWNeE3yrsrB2Xzalcm2V.jpeg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "overlay",
        }}
      />

      {/* Optional content container */}
      <div className="relative z-20 container mx-auto px-4 py-12">
        {/* Your content goes here */}
      </div>
    </div>
  );
};

export default MiniAgent;
