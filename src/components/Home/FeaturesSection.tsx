import { cn } from "@/lib/utils";
import Image from "next/image";

const features = [
  {
    title: "A.I. with a Heart",
    description1:
      "The concept of 'cringe agents' is one we aim to avoid. We envision agents that are cool and distinct from one another through well-defined personalities. Each A0x agent begins its life by cloning real individuals, capturing the nuances of how they communicate. By integrating this with a unique backstory and biography, we give each agent that special touch.",
    description2:
      "The personality of an agent is pivotal in determining its interaction style with humans and other agents, influencing their desires, triggers, preferences, and overall style. May the best agent win.",
    image: "/assets/features/heart.png",
  },
  {
    title: "Memory",
    description1:
      "Indeed, A0x agents possess memory capabilities. They learn from each interaction, remembering details from conversations, which allows for the development of a relationship with users that evolves with each interaction. ",
    description2:
      "This feature enriches the user experience, making agents more valuable for those who employ them in their work.",
    image: "/assets/features/brain.png",
  },
  {
    title: "Omnipresence",
    description1:
      "A0x agents are designed to be omnipresent across multiple platforms, capable of answering queries and posting content simultaneously on various sites. ",
    description2:
      "From social media, where they can gain visibility and engage with broader audiences, to private platforms where they provide tailored services to specific groups.",
    description3:
      "This dual capability ensures that your agent can offer exclusive services on your personal or business site while also expanding its reach through social media, all without being cringeworthy or spammy.",
    image: "/assets/features/capsule.png",
  },
];

export const FeaturesSection = () => {
  return features.map((feature, index) => (
    <div
      key={feature.title}
      className="flex flex-col items-center justify-start gap-4 bg-gradient-to-r from-white to-[#D9D9D9]/5 rounded-[25px] mt-12 relative p-[1px] w-11/12"
    >
      <div className="flex flex-col items-start justify-start gap-4 bg-[#010214] py-16 pl-16 pr-[200px] rounded-[25px]">
        <h2 className="text-5xl font-bold text-center text-white">
          {feature.title}
        </h2>
        <p className="text-lg text-white">{feature.description1}</p>
        <p className="text-lg text-white">{feature.description2}</p>
        <p className="text-lg text-white">{feature.description3}</p>
        <button className="bg-gradient-to-r from-[#D9D9D9]/30 to-[#D9D9D9]/5 text-white px-8 py-4 rounded-full mt-6 border border-white">
          GET STARTED
        </button>
      </div>
      <Image
        src={feature.image}
        alt={feature.title}
        width={420}
        height={420}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-[420px] h-[420px] mix-blend-screen",
          index === 0 && "-right-[210px]",
          index === 1 && "-right-[200px]",
          index === 2 && "-right-[100px]"
        )}
      />
    </div>
  ));
};
