// next
import Image from "next/image";

// icons
import {
  MessageSquare,
  Trash2,
  Image as ImageIcon,
  Copy,
  BatteryCharging,
} from "lucide-react";

// react
import { useState, useRef } from "react";

// types
import { Agent } from "@/types";

// components
import { Sheet, SheetContent } from "../shadcn/sheet";
import { ChatWithOwnAgent } from "./ChatWithOwnAgent";
import { AgentLifeBar } from "./AgentLifeBar";

// toast
import { toast } from "../shadcn/use-toast";

// utils
import { formatBalance } from "@/lib/utils";
import axios from "axios";

interface HeaderProps {
  agent: Agent;
  refetchAgent: () => void;
}

export const Header: React.FC<HeaderProps> = ({ agent, refetchAgent }) => {
  const [openChat, setOpenChat] = useState(false);
  const [openTokenDeployer, setOpenTokenDeployer] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUpdatingBattery, setIsUpdatingBattery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Token deployer agent ID
  const tokenDeployerAgentId = "889e5d72-03fd-0f64-891a-130943ec4d46";

  const handleFreeUpdateBattery = async () => {
    try {
      setIsUpdatingBattery(true);

      const response = await axios.post(`/api/agents/battery`, {
        agentId: agent.agentId,
      });

      if (response.status !== 200) {
        throw new Error("Error updating battery");
      }

      toast({
        title: "Battery updated successfully",
        description: "The battery has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error updating battery",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsUpdatingBattery(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("image", file);
      formData.append("agentId", agent.agentId || "");

      const response = await fetch(`/api/image-agent`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error uploading image");
      }

      if (response.ok) {
        setUploadedImageUrl(URL.createObjectURL(file));
      }

      toast({
        title: "Image updated successfully",
        description: "The agent image has been updated",
      });

      // refetch agent en segundo plano
      refetchAgent();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error uploading image",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  // Determinar qué URL de imagen mostrar
  const displayImageUrl = uploadedImageUrl || agent.imageUrl;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {displayImageUrl && (
            <div className="h-16 w-16 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
              <Image
                src={displayImageUrl}
                alt={`${agent.name}`}
                width={64}
                height={64}
                className="h-full w-full"
              />
            </div>
          )}
          <h1 className="text-gray-800 text-2xl font-bold">
            Dashboard of {agent.name}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />

          <button
            className="flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-full px-4 py-2 border border-blue-700/20 shadow-[0px_4px_8px_0px_rgba(17,18,35,0.25)] hover:from-blue-500/80 hover:to-blue-700/80 transition-all duration-200 neon-glow disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <ImageIcon className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Change image"}
          </button>

          <button
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-primary to-brand-border rounded-full p-2 border border-brand-border/20 shadow-[0px_4px_8px_0px_rgba(17,18,35,0.25)] hover:from-brand-primary/80 hover:to-brand-border/80 transition-all duration-200 neon-glow gap-2"
            id="chat-with-agent-button"
            onClick={() => {
              setOpenChat(!openChat);
            }}
          >
            <MessageSquare className="h-4 w-4" />
            Chat with {agent.name}
          </button>

          {!agent.token && agent.name !== "jessexbt" && (
            <button
              id="deploy-token-button"
              onClick={() => {
                setOpenTokenDeployer(!openTokenDeployer);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center bg-yellow-500 text-white shadow-md hover:bg-yellow-500/80`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 18V6" />
              </svg>
              Deploy Token
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
        <div className="space-y-2">
          <p>
            <span className="font-semibold">ID:</span> {agent.agentId}
          </p>

          <p>
            <span className="font-semibold">Version:</span> {agent.a0xVersion}
          </p>
        </div>
      </div>

      <div className="w-full flex justify-between items-center py-2">
        {agent.agentWallet && (
          <p>
            <span className="font-semibold">Agent Wallet Address:</span>{" "}
            {agent.agentWallet?.walletAddress}
            <button
              className="ml-1 text-black/40 hover:text-black/70"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(agent.agentWallet.walletAddress);
                toast({
                  title: "Wallet Address Copied",
                  description:
                    "The wallet address of the agent has been copied to your clipboard",
                });
              }}
            >
              <Copy size={12} />
            </button>
          </p>
        )}
        {/* <p>
          <span className="font-semibold">A0x Balance:</span>{" "}
          {formatBalance(agent.life.a0xBalance)}
        </p> */}
      </div>

      {agent.name !== "jessexbt" && (
        <AgentLifeBar agent={agent} refetchAgent={refetchAgent} />
      )}

      {openChat && (
        <Sheet open={openChat} onOpenChange={setOpenChat}>
          <SheetContent className="w-full max-w-4xl bg-[#121212] border border-[rgb(63,63,63)] p-0">
            <ChatWithOwnAgent agent={agent} />
          </SheetContent>
        </Sheet>
      )}

      {openTokenDeployer && (
        <Sheet open={openTokenDeployer} onOpenChange={setOpenTokenDeployer}>
          <SheetContent className="w-full max-w-4xl bg-[#121212] border border-[rgb(63,63,63)] p-0">
            <ChatWithOwnAgent
              agent={{
                ...agent,
                agentId: tokenDeployerAgentId,
                name: "token-deployer",
              }}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};
