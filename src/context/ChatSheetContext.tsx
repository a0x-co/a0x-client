import { createContext, useContext, useState, ReactNode } from "react";

type ChatSheetContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  trigger: "create_agent" | "none";
  setTrigger: (trigger: "create_agent" | "none") => void;
};

const ChatSheetContext = createContext<ChatSheetContextType | undefined>(
  undefined
);

export function ChatSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<"create_agent" | "none">("none");
  return (
    <ChatSheetContext.Provider
      value={{ isOpen, setIsOpen, trigger, setTrigger }}
    >
      {children}
    </ChatSheetContext.Provider>
  );
}

export function useChatSheet() {
  const context = useContext(ChatSheetContext);
  if (context === undefined) {
    throw new Error("useChatSheet must be used within a ChatSheetProvider");
  }
  return context;
}
