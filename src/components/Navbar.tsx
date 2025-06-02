"use client";

// react
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";

// next
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

// types
import { Agent } from "@/types";

// react-query
import { useQuery } from "@tanstack/react-query";

// lucide
import { cn } from "@/lib/utils";
import { useLogout, usePrivy, useWallets } from "@privy-io/react-auth";
import { Bot, Wallet } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";

interface ButtonProps {
  variant: "ghost" | "default";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = React.memo(
  ({ variant, className, children, onClick, disabled }) => {
    const baseStyle = "px-4 py-2 rounded-xl flex items-center";
    const variantStyle =
      variant === "ghost"
        ? "border border-white text-white"
        : "bg-white text-black";
    return (
      <button
        className={`${baseStyle} ${variantStyle} ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const getAgentByAddress = async (address: string): Promise<Agent[] | null> => {
  try {
    const response = await fetch(`${BASE_URL}/api/agents?address=${address}`);
    const agents = await response.json();
    if (agents.error) {
      return null;
    }
    return agents;
  } catch (error) {
    console.error("Error fetching agent:", error);
    return null;
  }
};

const NavbarComponent = React.memo(() => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [copied, setCopied] = useState(false);
  const [isAgentsDropdownOpen, setIsAgentsDropdownOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { ready, authenticated, login } = usePrivy();
  const disableLogin = !ready || (ready && authenticated);

  const { wallets } = useWallets();
  const { disconnect } = useDisconnect();

  const addressRef = useRef<string | null>(null);

  const { logout } = useLogout({
    onSuccess: () => {
      console.log("User logged out");
    },
  });

  const handleSignout = useCallback(async () => {
    await logout();
    disconnect();
  }, [logout, disconnect]);

  const handleCopy = useCallback(async () => {
    if (!wallets[0].address) return;
    try {
      await navigator.clipboard.writeText(wallets[0].address);
      console.log("Wallet address copied to clipboard");
      setCopied(true);
    } catch (error) {
      console.error("Error copying wallet address", error);
    } finally {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [wallets]);

  const addressLowerCase = useMemo(() => {
    if (wallets[0] && wallets[0].address) {
      addressRef.current = wallets[0].address;
      return wallets[0].address.toLowerCase();
    }
    return "";
  }, [wallets]);

  const pathname = usePathname();
  const isLanding = useMemo(() => pathname === "/", [pathname]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["agent", addressLowerCase],
    queryFn: () => getAgentByAddress(addressLowerCase),
    enabled: !!addressLowerCase,
  });

  useEffect(() => {
    if (data && addressLowerCase) {
      setAgents(data);
    }
  }, [data, addressLowerCase]);

  const firstAgentCreatorAddress = useMemo(
    () =>
      Array.isArray(agents[0]?.creatorAddress)
        ? agents[0]?.creatorAddress[0]
        : agents[0]?.creatorAddress,
    [agents]
  );

  useEffect(() => {
    if (addressRef.current && firstAgentCreatorAddress) {
      if (addressRef.current !== firstAgentCreatorAddress) {
        refetch();
      }
    }
  }, [firstAgentCreatorAddress, refetch]);

  const toggleAgentsDropdown = useCallback(() => {
    setIsAgentsDropdownOpen((prev) => !prev);
  }, []);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  // Check if the path has a twitter auth param
  const searchParams = useSearchParams();
  const isTwitterAuth = useMemo(
    () => searchParams.get("auth") === "twitter",
    [searchParams]
  );
  const isFarcasterAuth = useMemo(
    () => searchParams.get("auth") === "farcaster",
    [searchParams]
  );

  const handleLogin = useCallback(() => {
    login({
      loginMethods: isTwitterAuth
        ? ["twitter"]
        : isFarcasterAuth
        ? ["farcaster"]
        : ["email", "wallet", "telegram", "twitter", "farcaster"],
    });
  }, [login, isTwitterAuth, isFarcasterAuth]);

  useEffect(() => {
    if (ready && authenticated) {
      const timer = setTimeout(() => {
        if (wallets.length === 0) {
          console.log("ready and authenticated but no wallets after 8 seconds");
          handleSignout();
        }
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [ready, authenticated, wallets, handleSignout]);

  return (
    <nav className="flex items-center bg-[#121212] border border-[rgb(63,63,63)] p-3 rounded-2xl space-x-4 fixed top-4 left-1/2 transform -translate-x-1/2 shadow-lg z-50">
      <Link href="/">
        <h1 className="text-lg font-bold flex items-center space-x-1 text-white">
          <span className="border-t-4 border-white w-6 block"></span>
          <span>A0X.CO</span>
        </h1>
      </Link>

      {isLanding && (
        <Link
          href="/corporate"
          className="text-white/80 hover:text-white transition-colors duration-200"
        >
          Enterprise
        </Link>
      )}

      <div className="flex items-center space-x-2 ml-auto">
        <Link href="/workforce">
          <Button variant="ghost" className="flex items-center gap-2">
            <Bot size={16} />
            <span className="max-md:hidden">Agents</span>
          </Button>
        </Link>

        {ready && authenticated ? (
          <div className="group relative inline-block">
            <button
              className="bg-white text-black px-4 py-2 rounded-xl flex items-center transition-all duration-300 hover:bg-white/75"
              onClick={toggleDropdown}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <p>
                {wallets[0] && wallets[0].address
                  ? wallets[0].address?.slice(0, 6) +
                    "..." +
                    wallets[0].address?.slice(-4)
                  : "Connect Wallet"}
              </p>
            </button>

            <div
              className={`absolute right-0 mt-2 w-full bg-white text-black rounded-xl shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 overflow-hidden z-50 ${
                isDropdownOpen ? "visible opacity-100" : "invisible opacity-0"
              }`}
            >
              <button
                onClick={handleCopy}
                className={cn(
                  "w-full px-4 py-2 text-center transition-all duration-300",
                  copied ? "bg-green-500/20" : "hover:bg-gray-200"
                )}
              >
                Copy Wallet
              </button>
              <button
                onClick={handleSignout}
                className="w-full px-4 py-2 text-center hover:bg-red-500/20"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <Button
            variant="default"
            onClick={handleLogin}
            disabled={disableLogin}
            className="flex items-center max-md:space-x-2"
          >
            <span className="">Connect</span>
          </Button>
        )}

        {ready && authenticated && agents.length > 0 && (
          <div className="group relative inline-block">
            <button
              className="bg-[#333333] text-white px-4 py-2 rounded-xl flex items-center transition-all duration-300 hover:bg-[#444444]"
              onClick={toggleAgentsDropdown}
              onMouseEnter={() => setIsAgentsDropdownOpen(true)}
              onMouseLeave={() => setIsAgentsDropdownOpen(false)}
            >
              <Bot size={16} className="mr-2" />
              <p>My Agents</p>
            </button>

            <div
              className={`absolute right-0 mt-2 w-full bg-white text-black rounded-xl shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 overflow-hidden z-50 ${
                isAgentsDropdownOpen
                  ? "visible opacity-100"
                  : "invisible opacity-0"
              }`}
            >
              {agents.map((agent, index) => (
                <Link href={`/agent/${agent.name}/dashboard`} key={index}>
                  <button className="w-full px-4 py-2 text-center hover:bg-sky-500/20">
                    {agent.name}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

NavbarComponent.displayName = "Navbar";

export const Navbar = NavbarComponent;
