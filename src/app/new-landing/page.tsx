import { getAccount } from "@/app/api/auth/options";

// components
import { CreateAgentSheet } from "@/components/Home/CreateAgentSheet";

export default async function NewLanding() {
  const account = await getAccount();

  return (
    <main className="min-h-screen w-screen overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
      <CreateAgentSheet account={account} />
    </main>
  );
}
