"use client";

// react

// components
import { useChatSheet } from "@/context/ChatSheetContext";
import { Bot } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../shadcn/sheet";
import { ChatWithAgent } from "./ChatWithAgent";

export function CreateAgentSheet({
  account,
}: {
  account: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    username: string;
  };
}) {
  const { setIsOpen, isOpen, trigger } = useChatSheet();
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        className="bg-[#121212] text-white p-2 rounded-full flex items-center group transition-all duration-300 w-12 hover:w-32 border border-[rgb(63,63,63)]"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="w-8 h-8 animate-rotate-soft group-hover:animate-none" />
        <span className="text-sm absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          A0x Agent
        </span>
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full max-w-4xl bg-[#121212] border border-[rgb(63,63,63)] p-0">
          <ChatWithAgent account={account} trigger={trigger} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
