import { Metadata } from "next";

// components
import App from "./app";
import axios from "axios";

// env
const appUrl = process.env.NEXT_PUBLIC_URL;

export const revalidate = 300;

async function getAgent(handle: string) {
  try {
    const response = await axios.get(`${appUrl}/api/agents?name=${handle}`);
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error al obtener el balance:", error);
    return "0";
  }
}

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const { handle } = params;
  const agent = await getAgent(handle);

  // Aseguramos que siempre tengamos una imagen válida para el Open Graph
  const defaultImage =
    "https://storage.googleapis.com/a0x-mirror-storage/agent-empty.png";
  const pfpAgent =
    agent?.imageUrl || agent?.farcasterClient?.pfp_url || defaultImage;

  const pfpAgentEncoded = encodeURIComponent(pfpAgent);
  const cover = `${appUrl}/assets/images/og.jpg`;
  const logoA0X = `${appUrl}/assets/a0xwhite.png`;
  const encodedHandle = encodeURIComponent(handle);
  const encodedCover = encodeURIComponent(cover);
  const encodedLogoA0X = encodeURIComponent(logoA0X);
  const url = `/agent/${handle}/frame/open-graph?handle=${encodedHandle}&cover=${encodedCover}&logoA0X=${encodedLogoA0X}&pfpAgent=${pfpAgentEncoded}`;
  const frame = {
    version: "next",
    imageUrl: `${appUrl}${url}`,
    button: {
      title: `Talk with ${handle}`,
      action: {
        type: "launch_frame",
        name: "A0x Agent",
        url: `${appUrl}/agent/${handle}/frame`,
        splashImageUrl: `${appUrl}/assets/images/og.jpg`,
        splashBackgroundColor: "#f7f7f7",
      },
    },
  };
  return {
    title: "A0x Agent",
    openGraph: {
      title: "A0x Agent",
      description: `Chat with ${handle} on A0x`,
      images: [
        {
          url,
          width: 600,
          height: 400,
        },
      ],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home({ params }: { params: { handle: string } }) {
  const { handle } = params;
  return <App handle={handle as string} />;
}
