"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useChatSheet } from "@/context/ChatSheetContext";
import { FaTwitter, FaTelegram, FaLinkedin } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TerminalLine {
  id: string;
  username: string;
  message: string;
  timestamp: string;
}

const TypeWriter = ({ text, className }: { text: string; className: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const char = text[currentIndex];
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + char);
        setCurrentIndex(c => c + 1);
        if (currentIndex === text.length - 1) {
          setIsComplete(true);
        }
      }, 15); // Faster typing speed

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <div className={className}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-2 h-4 ml-1 bg-white/80 animate-pulse" />
      )}
    </div>
  );
};

const TerminalHero = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const { setTrigger, setIsOpen } = useChatSheet();
  const indexRef = useRef(0);
  const bannerStartedRef = useRef(false);
  const bannerIndexRef = useRef(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const bannerLines = [
    "  /******   /******  /**   /**",
    " /**__  ** /***_  **| **  / **",
    "| **  \\ **| ****\\ **|  **/ **/",
    "| ********| ** ** ** \\  ****/ ",
    "| **__  **| **\\ ****  >**  ** ",
    "| **  | **| ** \\ *** /**/\\  **",
    "| **  | **|  ******/| **  \\ **",
    "|__/  |__/ \\______/ |__/  |__/",
  ];

  const conversations = [
    {
      username: "builder",
      message:
        "Unique ai x crypto powered agents built to scale complex operations.",
    },
    {
    username: "agentbot",
    message: "Loading AI agent infrastructure... Monitoring agent Activity...",
    },
    {
      username: "agentbot",
      message:
        "Training knowledge... Unique personalities... Connecting to data sources... ",
    },
    {
      username: "agentbot",
      message: "Connecting to X, Farcaster, Telegram, Website... Setting automations...",
    },
    {
    username: "agentbot",
    message: "Deploying..."
  }
  ];

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour12: false });
  };

  const handleCreateAgent = () => {
    setTrigger("create_agent");
    setIsOpen(true);
  };

  const handleKnowMore = () => {
    router.push('/classic');
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let isActive = true;

    const addLine = () => {
      if (!isPlaying || !isActive) return;

      if (indexRef.current < conversations.length) {
        const timestamp = getTimestamp();
        const newLine = {
          ...conversations[indexRef.current],
          timestamp,
          id: `${timestamp}-${indexRef.current}`,
        };
        setLines((prev) => {
          if (prev.some((line) => line.id === newLine.id)) return prev;
          return [...prev, newLine];
        });
        indexRef.current++;
        // Shorter delays between lines
        const nextDelay = indexRef.current === 1 ? 1200 : 1600;
        timeout = setTimeout(addLine, nextDelay);
      } else if (!bannerStartedRef.current) {
        bannerStartedRef.current = true;
        timeout = setTimeout(addLine, 400); // Shorter delay before ASCII art
      } else if (bannerIndexRef.current < bannerLines.length) {
        const timestamp = getTimestamp();
        const newBannerLine = {
          username: "",
          message: bannerLines[bannerIndexRef.current],
          timestamp,
          id: `${timestamp}-banner-${bannerIndexRef.current}`,
        };
        setLines((prev) => {
          if (prev.some((line) => line.id === newBannerLine.id)) return prev;
          return [...prev, newBannerLine];
        });
        bannerIndexRef.current++;
        timeout = setTimeout(addLine, 100);
      } else {
        timeout = setTimeout(() => {
          if (!isActive) return;
          setLines([]);
          indexRef.current = 0;
          bannerStartedRef.current = false;
          bannerIndexRef.current = 0;
          setTimeout(addLine, 100);
        }, 15000); // Shorter delay before restart
      }
    };

    addLine();

    return () => {
      isActive = false;
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="h-screen bg-[#1752F0] flex flex-col">
      <div
        ref={terminalRef}
        className="terminal-scrollbar flex-1 font-mono text-white pt-24 sm:pt-28 md:pt-32 px-6 sm:px-8 md:px-10 lg:px-12 pb-16 overflow-y-auto relative"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          backgroundColor: "#1752F0",
          fontSize: "13px",
          letterSpacing: "0.05em",
        }}
      >
        {/* Scanline effect */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: 'linear-gradient(rgba(255,255,255,0.03) 50%, transparent 50%)',
            backgroundSize: '100% 4px',
            animation: 'scan 8s linear infinite'
          }}
        />

        {/* Terminal content */}
        <div className="relative z-10">
          {lines.map((line, index) => (
            <motion.div 
              key={line.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`${line.username ? 'mb-2 sm:mb-3 leading-relaxed' : 'leading-none'}`}
            >
              {line.username && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-0">
                  <span className="text-white/50 font-bold tracking-wider text-xs sm:text-sm">[{line.timestamp}]</span>
                  <span className="text-white font-bold tracking-wider text-xs sm:text-sm">{line.username}:</span>
                </div>
              )}
              <TypeWriter 
                text={line.message}
                className={`${!line.username ? 'font-bold text-white tracking-wider text-xs sm:text-lg md:text-xl lg:text-2xl whitespace-pre leading-tight sm:leading-normal' : 'text-white/90 pl-0 sm:pl-4 text-xs sm:text-sm md:text-base break-words'} flex items-center`}
              />
            </motion.div>
          ))}
          {isPlaying && (
            <motion.span
              className="inline-block h-4 sm:h-5 w-1 sm:w-2 bg-white ml-2 sm:ml-4"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full h-auto sm:h-12 bg-[#00008B] border-t border-b-0 border-white/20 relative z-20">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full">
          <div className="flex flex-col sm:flex-row items-center h-full w-full sm:w-auto">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-full sm:w-auto text-white/80 hover:text-white font-mono tracking-wider px-4 py-2 sm:py-0 border-b sm:border-b-0 sm:border-r border-white/20 text-sm"
            >
              [ PAUSE ]
            </button>
            <Link 
              href="https://a00-4.gitbook.io/a0x-company/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-white/80 hover:text-white font-mono tracking-wider px-4 py-2 sm:py-0 border-b sm:border-b-0 sm:border-r border-white/20 text-center text-sm"
            >
              [ TERMS ]
            </Link>
            <div className="flex items-center justify-center space-x-4 px-4 py-2 sm:py-0 w-full sm:w-auto border-b sm:border-b-0 sm:border-r border-white/20">
              <Link href="https://x.com/a0xbot" target="_blank" rel="noopener noreferrer">
                <FaTwitter className="w-3 h-3 text-white/80 hover:text-white transition-colors" />
              </Link>
              <Link href="https://t.me/A0X_Portal" target="_blank" rel="noopener noreferrer">
                <FaTelegram className="w-3 h-3 text-white/80 hover:text-white transition-colors" />
              </Link>
              <Link href="https://www.linkedin.com/company/a0x" target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="w-3 h-3 text-white/80 hover:text-white transition-colors" />
              </Link>
              <Link href="https://dexscreener.com/base/0xa1a65c284a2e01f0d9c9683edeab30d0835d1362" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/assets/images/dexlogoblack.png"
                  alt="Dex Screener"
                  width={12}
                  height={12}
                  className="invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center h-full w-full sm:w-auto">

          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          from { transform: translateY(0); }
          to { transform: translateY(4px); }
        }
        @media (max-width: 640px) {
          .whitespace-pre {
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        }
      `}</style>
    </div>
  );
};

export default TerminalHero;
