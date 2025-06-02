"use client";

import { useState } from "react";

interface AIChatProps {
  account: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    username: string;
  };
}

export function AIChat({ account }: AIChatProps) {
  const [messages, setMessages] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
    }>
  >([
    {
      role: "assistant",
      content: "¡Hola! Soy tu asistente AI. ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Agregar mensaje del usuario
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    // TODO: Implementar la llamada al backend
    // const response = await fetch(...);

    setInput("");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-blue-500/20">
        <h2 className="text-blue-400 font-semibold">AI Assistant</h2>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-900/40 text-blue-100"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-blue-500/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-blue-950/40 border border-blue-500/20 rounded-xl px-4 py-2 
                     text-blue-100 placeholder-blue-400/50 focus:outline-none 
                     focus:border-blue-500/50"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl 
                     text-white transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
