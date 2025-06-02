import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

const phrases = [
  "The Fabric of AI Agents",
  "Your Digital Clone",
"AI-Powered Digital Self"
];

export const Title: React.FC = () => {
  const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const currentIndex = useRef(0);

  const scrambleText = (finalText: string, callback: () => void) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let iterations = 0;
    const maxIterations = 20;

    const interval = setInterval(() => {
      setCurrentPhrase(prevText => {
        return finalText
          .split('')
          .map((char, index) => {
            if (index < iterations) return finalText[index];
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('');
      });

      iterations += 1;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        setCurrentPhrase(finalText);
        callback();
      }
    }, 50);

    return interval;
  };

  useEffect(() => {
    const rotateText = () => {
      setIsScrambling(true);
      currentIndex.current = (currentIndex.current + 1) % phrases.length;
      const nextPhrase = phrases[currentIndex.current];
      
      const interval = scrambleText(nextPhrase, () => {
        setIsScrambling(false);
      });
      
      intervalRef.current = interval;
    };

    const timer = setInterval(rotateText, 3000);

    return () => {
      clearInterval(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden flex items-center justify-center -mt-16">
      {/* Background silhouettes */}
      <div className="absolute inset-0 opacity-30">
        {/* Left profile */}
        <div className="absolute bottom-0 left-0 h-[90%] w-1/3">
          <Image
            src="/assets/girl_profile_a0x 4.png"
            alt="profile silhouette"
            fill
            className="object-contain object-left-bottom"
          />
        </div>

        {/* Right profile */}
        <div className="absolute bottom-0 right-0 h-[90%] w-1/3">
          <Image
            src="/assets/girl_profile_a0x 5.png"
            alt="profile silhouette"
            fill
            className="object-contain object-right-bottom"
          />
        </div>

        {/* Connection lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/assets/curves.png"
            alt="connection lines"
            width={1200}
            height={600}
            className="w-full h-full object-contain opacity-30"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative text-center z-10">
        <div className="relative">
          {/* Intense glow behind text */}
          <div className="absolute -inset-x-8 -inset-y-8 bg-[radial-gradient(closest-side,rgba(56,189,248,0.8),transparent_100%)] blur-xl" />
          
          <h1 className="relative text-[120px] font-black tracking-tight uppercase leading-none">
            {/* Close glow text layer */}
            <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-b from-white to-sky-200 blur-[3px] select-none">
              A0X MIRROR
            </span>
            {/* Main text layer */}
            <span className="relative bg-clip-text text-transparent bg-gradient-to-b from-white to-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,1)]">
              A0X MIRROR
            </span>
          </h1>
        </div>
        
        <p className="mt-6 h-8 text-2xl font-medium tracking-widest text-sky-200 uppercase drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
          {currentPhrase}
        </p>
      </div>
    </div>
  );
}; 