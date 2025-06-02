import { Check } from "lucide-react";
import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";

export const OneClickSection = () => {
  return (
    <div className="max-w-6xl mx-auto text-center my-12 relative bg-gradient-to-r from-white to-[#D9D9D9]/5 rounded-[25px] p-[1px]">
      <div className="relative bg-[#010214] rounded-[25px] overflow-hidden px-8 py-16">
        <h2 className="text-5xl font-bold text-white mb-16">
          One-Click Creation
        </h2>

        <div className="flex items-center justify-between gap-16">
          {/* Left Card */}
          <div className="w-[400px] bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="relative">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <Image
                  src="/assets/girl_profile_a0x 4.png"
                  alt="Profile"
                  width={64}
                  height={64}
                  className="rounded-full border border-white/10"
                />
              </div>
            </div>
            <div className="space-y-6 mt-8">
              <h3 className="text-2xl font-semibold text-white">
                Use your Social Media information.
              </h3>
              <p className="text-gray-400 text-lg">
                Connect at least one account.
              </p>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-black/50 border border-white/10">
                <FaXTwitter className="w-5 h-5 text-white" />
                <span className="text-white mr-auto">@You</span>
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Center Connection */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Connection lines - Made wider with stronger gradient */}
            <div className="absolute inset-x-[-100px] flex items-center">
              {/* Left line with dot */}
              <div className="w-1/2 flex items-center">
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent to-sky-400/50" />
                <div className="w-2 h-2 rounded-full bg-sky-400/80 -mr-1" />
              </div>
              {/* Right line with dot */}
              <div className="w-1/2 flex items-center">
                <div className="w-2 h-2 rounded-full bg-sky-400/80 -ml-1" />
                <div className="w-full h-[1px] bg-gradient-to-r from-sky-400/50 to-transparent" />
              </div>
            </div>

            {/* Center Portal */}
            <div className="relative z-10">
              {/* Concentric circles */}
              <div className="relative w-24 h-24">
                {/* Outer rings - more spaced out */}
                <div className="absolute inset-[-16px] rounded-full border border-sky-400/10" />
                <div className="absolute inset-[-8px] rounded-full border border-sky-400/15" />
                <div className="absolute inset-0 rounded-full border border-sky-400/20" />
                
                {/* Inner rings */}
                <div className="absolute inset-[8px] rounded-full border border-sky-400/25">
                  <div className="absolute inset-0 rounded-full border border-sky-400/10" />
                </div>
                
                {/* Core element */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Layered glows */}
                  <div className="absolute w-8 h-8">
                    <div className="absolute inset-0 bg-sky-400/10 blur-xl rounded-full" />
                    <div className="absolute inset-0 bg-sky-400/20 blur-lg rounded-full" />
                    <div className="absolute inset-0 bg-sky-400/30 blur-md rounded-full animate-pulse-slow" />
                  </div>
                  
                  {/* Core */}
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 bg-sky-400/50 rounded-full blur-[2px] animate-pulse-slow" />
                    <div className="absolute inset-0 bg-sky-400/70 rounded-full blur-[1px]" />
                    <div className="relative w-full h-full rounded-full bg-sky-400/90" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="w-[400px] bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="relative">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <Image
                  src="/assets/girl_profile_a0x 5.png"
                  alt="Profile"
                  width={64}
                  height={64}
                  className="rounded-full border border-white/10"
                />
              </div>
            </div>
            <div className="space-y-6 mt-8">
              <h3 className="text-2xl font-semibold text-white">
                Your AI Agent is ready
              </h3>
              <p className="text-gray-400 text-lg">
                Start interacting with your digital clone
              </p>
              <Link 
                href="/dashboard"
                className="inline-block w-full px-6 py-3 rounded-full bg-gradient-to-r from-[#FFB200] to-[#D35C01] text-white font-semibold hover:brightness-110 transition-all duration-300 text-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
