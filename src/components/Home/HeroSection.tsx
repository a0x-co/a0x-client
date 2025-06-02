import Image from "next/image";
import Link from "next/link";

export const HeroSection: React.FC = () => {
  return (
    <div className="text-center my-12 relative h-[600px] bg-[radial-gradient(98.87%_98.87%_at_51.11%_1.13%,rgba(0,0,0,0.00)_0%,#000_0.01%,#D35C01_76.56%,#FFB200_86.46%,#FFCD83_100%)] rounded-[50px] overflow-hidden flex flex-col items-center justify-center">
      {/* Left profile silhouette */}
      <div className="absolute bottom-0 left-0 h-[80%] w-1/3">
        <Image
          src="/assets/girl_profile_a0x 4.png"
          alt="profile silhouette"
          fill
          className="object-contain object-left-bottom"
        />
      </div>

      {/* Content */}
      <div className="relative py-24 px-8 flex flex-col items-center justify-center min-h-[600px] text-center z-10">
        <div className="inline-block px-6 py-2 rounded-full text-sm text-white border border-white/20 bg-white/5 backdrop-blur-sm mb-8">
          Create an AI agent for your social media
        </div>
        
        <h2 className="text-6xl font-bold text-white mb-6">
          Clone yourself,<br />
          Create the double
        </h2>
        
        <p className="text-white/90 text-lg max-w-2xl mb-12">
          Your agent will reply and communicate like you in your social media,<br />
          A token will be launched along your agent so it could be traded and pumped.
        </p>

        <Link
          href="/create-agent"
          className="px-12 py-4 rounded-full text-white border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
        >
          Start now
        </Link>
      </div>

      {/* Right profile silhouette */}
      <div className="absolute bottom-0 right-0 h-[80%] w-1/3">
        <Image
          src="/assets/girl_profile_a0x 5.png"
          alt="profile silhouette"
          fill
          className="object-contain object-right-bottom"
        />
      </div>

      {/* Connection lines overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Image
          src="/assets/curves.png"
          alt="connection lines"
          width={1200}
          height={600}
          className="w-full h-full object-contain opacity-50"
        />
      </div>
    </div>
  );
};
