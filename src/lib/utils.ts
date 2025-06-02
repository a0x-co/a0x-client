import { ParsedMessage, ParsedConversationContext } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatBalance = (balance: number) => {
  if (balance >= 1000000) {
    return `${(balance / 1000000).toFixed(1)}M`;
  } else if (balance >= 1000) {
    return `${(balance / 1000).toFixed(1)}K`;
  }
  return balance.toLocaleString();
};

export function parseMessage(input: string): ParsedMessage {
  // Primero desescarpar los caracteres \n en el input
  const unescapedInput = input.replace(/\\n/g, "\n");

  const sections = unescapedInput.split(/^---\s*$/gm); // divide por líneas que solo tengan '---'

  const originalMessageSection =
    sections
      .find(
        (s) =>
          !s.includes("NOTE:") &&
          !s.includes("PARTICIPANT SUMMARIES:") &&
          !s.includes("CONVERSATION TOPICS:")
      )
      ?.trim() || "";

  const topicsSection =
    sections.find((s) => s.includes("CONVERSATION TOPICS:")) || "";
  const conversationTopics = topicsSection
    .replace("CONVERSATION TOPICS:", "")
    .trim()
    .split(",")
    .map((topic) => topic.trim());

  const participantSection =
    sections.find((s) => s.includes("PARTICIPANT SUMMARIES:")) || "";
  const participantSummaries: Record<string, string> = {};

  const lines = participantSection
    .replace("PARTICIPANT SUMMARIES:", "")
    .trim()
    .split("\n");

  for (const line of lines) {
    const match = line.match(/^@@(\S+):\s*(.+)$/);
    if (match) {
      const [, username, summary] = match;
      participantSummaries[username] = summary;
    }
  }

  return {
    originalMessage: originalMessageSection,
    conversationTopics,
    participantSummaries,
  };
}

export function parseConversationContext(
  input: string
): ParsedConversationContext {
  // Extraer el mensaje del usuario y el contexto de la conversación
  const regex =
    /<CONVERSATION CONTEXT>([\s\S]*?)<\/CONVERSATION CONTEXT>\s*([\s\S]*)/;
  const match = input.match(regex);

  if (!match) {
    return {
      userMessage: input,
      conversationSummary: "",
      newInsights: "",
      discussionTopics: [],
      conversationPhase: "",
      conversationTone: "",
      userStance: "",
      potentialQuestions: [],
      recommendedResponses: [],
      responseState: "",
      responseStateReason: "",
      patternDetected: "",
      responseHistory: "",
      recentResponseDecisions: [],
      responseDecision: "",
      recentCommands: [],
      currentCommand: "",
    };
  }

  const [, contextContent, userMessage] = match;

  // Extraer los diferentes componentes del contexto
  const summaryMatch = contextContent.match(
    /Conversation summary:\s*([\s\S]*?)(?=\s*New insights:|$)/
  );
  const insightsMatch = contextContent.match(
    /New insights:\s*([\s\S]*?)(?=\s*Topics being discussed:|$)/
  );

  // Capturar temas de conversación - pueden estar en diferentes formatos
  let topicsMatch = contextContent.match(
    /Topics being discussed:\s*([\s\S]*?)(?=\s*The conversation is in|$)/
  );
  if (!topicsMatch) {
    // Intentar capturar si no hay un formato estándar de "Topics being discussed:"
    topicsMatch = contextContent.match(
      /(?:discussed|discussing):\s*([\s\S]*?)(?=\s*The conversation is|$)/
    );
  }

  const phaseMatch = contextContent.match(
    /The conversation is in the\s*(.*?)\s*phase/
  );
  const toneMatch = contextContent.match(/with a\s*(.*?)\s*tone/);
  const userStanceMatch = contextContent.match(
    /The user appears to be\s*(.*?)(?=\.|$)/
  );

  const questionsMatch = contextContent.match(
    /Questions they might ask next:\s*([\s\S]*?)(?=\s*Recommended ways to respond:|$)/
  );
  const responsesMatch = contextContent.match(
    /Recommended ways to respond:\s*([\s\S]*?)(?=\s*RESPONSE STATE:|$)/
  );

  const stateMatch = contextContent.match(
    /RESPONSE STATE:\s*Currently in\s*(.*?)\s*mode because\s*([\s\S]*?)(?=\s*In|$)/
  );
  const patternMatch = contextContent.match(
    /PATTERN DETECTED:\s*([\s\S]*?)(?=\s*RESPONSE HISTORY:|$)/
  );
  const historyMatch = contextContent.match(
    /RESPONSE HISTORY:\s*([\s\S]*?)(?=\s*(?:RECENT RESPONSE DECISIONS:|Recent commands used:|$))/
  );

  const recentDecisionsMatch = contextContent.match(
    /RECENT RESPONSE DECISIONS:\s*([\s\S]*?)(?=\s*(?:Recent commands used:|RESPONSE DECISION:|$))/
  );
  const decisionMatch = contextContent.match(
    /RESPONSE DECISION:\s*([\s\S]*?)(?=$)/
  );

  // Capturar información sobre comandos (si está presente)
  const recentCommandsMatch = contextContent.match(
    /Recent commands used:\s*([\s\S]*?)(?=\s*The current message|RESPONSE DECISION:|$)/
  );
  const currentCommandMatch = contextContent.match(
    /The current message contains a command:\s*(\/\w+)/
  );

  // Procesar las preguntas potenciales (separadas por punto y coma)
  const potentialQuestions = questionsMatch
    ? questionsMatch[1]
        .split(";")
        .map((q) => q.trim())
        .filter(Boolean)
    : [];

  // Procesar las respuestas recomendadas (separadas por punto y coma)
  const recommendedResponses = responsesMatch
    ? responsesMatch[1]
        .split(";")
        .map((r) => r.trim())
        .filter(Boolean)
    : [];

  // Procesar las decisiones recientes (separadas por paréntesis)
  const recentDecisions = recentDecisionsMatch
    ? recentDecisionsMatch[1]
        .split(");")
        .filter(Boolean)
        .map((d) => {
          const trimmed = d.trim();
          return trimmed.endsWith(")") ? trimmed : trimmed + ")";
        })
    : [];

  // Procesando los temas en discusión
  const discussionTopics = topicsMatch
    ? topicsMatch[1]
        .split(/,|;/)
        .map((topic) => topic.trim())
        .filter(Boolean)
    : [];

  // Procesar comandos recientes
  const recentCommands = recentCommandsMatch
    ? recentCommandsMatch[1]
        .split(/,|;/)
        .map((cmd) => cmd.trim())
        .filter(Boolean)
    : [];

  return {
    userMessage: userMessage.trim(),
    conversationSummary: summaryMatch ? summaryMatch[1].trim() : "",
    newInsights: insightsMatch ? insightsMatch[1].trim() : "",
    discussionTopics,
    conversationPhase: phaseMatch ? phaseMatch[1].trim() : "",
    conversationTone: toneMatch ? toneMatch[1].trim() : "",
    userStance: userStanceMatch ? userStanceMatch[1].trim() : "",
    potentialQuestions,
    recommendedResponses,
    responseState: stateMatch ? stateMatch[1].trim() : "",
    responseStateReason: stateMatch ? stateMatch[2].trim() : "",
    patternDetected: patternMatch ? patternMatch[1].trim() : "",
    responseHistory: historyMatch ? historyMatch[1].trim() : "",
    recentResponseDecisions: recentDecisions,
    responseDecision: decisionMatch ? decisionMatch[1].trim() : "",
    recentCommands,
    currentCommand: currentCommandMatch ? currentCommandMatch[1] : "",
  };
}
