const formatMarkdownContent = (content: string) => {
  if (!content) return null;

  const lines = content.split("\n");

  return (
    <div className="markdown-content">
      {lines.map((line, index) => {
        if (line.startsWith("# ")) {
          return (
            <h1 key={index} className="text-2xl font-bold mt-4 mb-2">
              {line.substring(2)}
            </h1>
          );
        } else if (line.startsWith("## ")) {
          return (
            <h2 key={index} className="text-xl font-semibold mt-3 mb-2">
              {line.substring(3)}
            </h2>
          );
        } else if (line.startsWith("### ")) {
          return (
            <h3 key={index} className="text-lg font-medium mt-2 mb-1">
              {line.substring(4)}
            </h3>
          );
        } else if (line.startsWith("- ")) {
          const content = line.substring(2);
          return (
            <div key={index} className="flex gap-2 my-1">
              <span>•</span>
              <span>{processMarkdownFormatting(content)}</span>
            </div>
          );
        } else if (line.trim() === "") {
          return <br key={index} />;
        }

        return (
          <p key={index} className="my-1">
            {processMarkdownFormatting(line)}
          </p>
        );
      })}
    </div>
  );
};

const processMarkdownFormatting = (text: string) => {
  const processed = text;

  let hasComplexElements = false;

  if (processed.includes("[") && processed.includes("](")) {
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(processed)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = processed.substring(lastIndex, match.index);

        parts.push(processBoldText(textBefore));
      }

      const [fullMatch, linkText, linkUrl] = match;

      const linkElement = (
        <a
          key={`link-${match.index}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {processBoldText(linkText)}
        </a>
      );

      parts.push(linkElement);
      hasComplexElements = true;

      lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < processed.length) {
      const textAfter = processed.substring(lastIndex);
      parts.push(processBoldText(textAfter));
    }

    if (hasComplexElements) {
      return <>{parts}</>;
    }

    return parts.length === 1 ? parts[0] : parts;
  }

  return processBoldText(processed);
};

const processBoldText = (text: string) => {
  if (!text.includes("**")) return text;

  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldContent = part.slice(2, -2);
      return <strong key={i}>{boldContent}</strong>;
    }
    return part;
  });
};

const getKnowledgeContent = (selectedKnowledge: any) => {
  if (!selectedKnowledge?.data) return null;

  if (typeof selectedKnowledge.data === "string") {
    return selectedKnowledge.data;
  }

  if (typeof selectedKnowledge.data === "object") {
    const possibleProps = [
      "text",
      "content",
      "body",
      "data",
      "summary",
      "mainTopics",
    ];

    for (const prop of possibleProps) {
      if (
        selectedKnowledge.data[prop] &&
        typeof selectedKnowledge.data[prop] === "string"
      ) {
        return selectedKnowledge.data[prop];
      }
    }

    return JSON.stringify(selectedKnowledge.data, null, 2);
  }

  return null;
};

export { formatMarkdownContent, getKnowledgeContent };
