import Image from "next/image";

export const ProcessSection = () => {
  return (
    <div className="text-center my-12 relative bg-[radial-gradient(98.87%_98.87%_at_51.11%_1.13%,rgba(0,0,0,0.00)_0%,#6A01D3_45.31%,#6A01D3_76.56%,#8F00FF_86.46%,#C883FF_100%)] rounded-[50px] overflow-hidden flex flex-col items-start p-16">
      <div className="relative flex flex-col items-start justify-center z-20 gap-8">
        <div className="flex flex-col items-start justify-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D9D9D9]/50 to-white leading-normal">
            Unleashing Limitless
          </h1>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D9D9D9]/50 to-white leading-normal -mt-5">
            Agent Actions
          </h1>
        </div>
        <p className="text-base font-normal text-white text-left w-full">
          We&apos;re revolutionizing how AI agents interact with technology.
        </p>
        <button className="flex items-center justify-center gap-4 bg-gradient-to-r from-[#FFB200] to-[#D35C01] rounded-full p-2 border border-[#D35C01]/20 shadow-[0px_4px_8px_0px_rgba(17,18,35,0.25)] text-white w-60 z-20">
          Start Now
        </button>
      </div>
      <Image
        src="/assets/features/circles.png"
        alt="Circles"
        width={960}
        height={540}
        className="absolute top-0 -right-20 z-10"
      />
    </div>
  );
};
