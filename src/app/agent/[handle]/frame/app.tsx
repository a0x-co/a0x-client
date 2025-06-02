"use client";

import dynamic from "next/dynamic";

// const Demo = dynamic(() => import("~/components/Demo"), {
//   ssr: false,
// });

const ChatAgentFrame = dynamic(
  () => import("@/components/AgentFrame/AgentFrame"),
  {
    ssr: false,
  }
);

export default function App({ handle }: { handle: string }) {
  return <ChatAgentFrame handle={handle} />;
}
