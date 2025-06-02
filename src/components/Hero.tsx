import React from 'react';
import Link from 'next/link';

export const Hero: React.FC = () => {
  return (
    <div className="relative bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-8 pb-24">
        <div className="rounded-3xl bg-gradient-to-b from-orange-500/20 to-orange-900/20 backdrop-blur-sm border border-white/5 p-16">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-block px-6 py-2 rounded-full text-sm text-white/80 border border-white/10 bg-white/5">
              Create an AI agent for your social media
            </div>
            
            <h2 className="text-5xl font-bold text-white">
              Clone yourself,<br />
              Create the double
            </h2>
            
            <p className="text-white/80 text-lg">
              Your agent will reply and communicate like you in your social media,<br />
              A token will be launched along your agent so it could be traded and pumped.
            </p>

            <Link href="/create-agent" className="inline-block mt-8">
              <button className="px-8 py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300">
                Start now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}; 