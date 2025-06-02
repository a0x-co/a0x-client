import { getAccount } from "@/app/api/auth/options";
import TerminalHero from "@/components/Landing/TerminalHero";
import { Navbar } from "@/components/Navbar";

export default async function Home() {
  const account = await getAccount();
  return (
    <main className="min-h-screen w-full overflow-hidden">
        <Navbar />
      <TerminalHero />
    </main>
  );
}
