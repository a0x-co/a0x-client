/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";
import { AgentPersonalityConfig, AgentPersonalityElizaFormat } from "@/types";
import { Check, FileJson, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "../shadcn/use-toast";

interface ImportFileProps {
  config: AgentPersonalityConfig;
  setConfig: (config: AgentPersonalityConfig) => void;
}

// Define the structure of attributes to track
interface AttributeTracker {
  PROFILE: {
    bio: boolean;
    lore: boolean;
  };
  STYLE: {
    all: boolean;
    chat: boolean;
    post: boolean;
  };
  KNOWLEDGE: {
    knowledge: boolean;
    topics: boolean;
  };
  MESSAGES: {
    messageExamples: boolean;
    postExamples: boolean;
  };
}

// Helper function to check if a specific path has changed
const hasPathChanged = (original: any, current: any, path: string): boolean => {
  if (!original || !current) {
    return false;
  }

  if (!path.includes(".")) {
    const originalHasProperty = original.hasOwnProperty(path);
    const currentHasProperty = current.hasOwnProperty(path);

    if (!originalHasProperty && !currentHasProperty) {
      return false;
    }

    if (originalHasProperty && !currentHasProperty) {
      return false;
    }

    if (!originalHasProperty && currentHasProperty) {
      return true;
    }

    const areEqual =
      JSON.stringify(original[path]) === JSON.stringify(current[path]);

    return !areEqual;
  }

  // For nested properties
  const parts = path.split(".");
  let origVal = original;
  let currVal = current;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (i === parts.length - 1) {
      if (!origVal || !currVal) {
        return false;
      }

      const originalHasProperty = origVal.hasOwnProperty(part);
      const currentHasProperty = currVal.hasOwnProperty(part);

      if (!originalHasProperty && !currentHasProperty) {
        return false;
      }
      if (originalHasProperty && !currentHasProperty) {
        return false;
      }
      if (!originalHasProperty && currentHasProperty) {
        return true;
      }

      const areEqual =
        JSON.stringify(origVal[part]) === JSON.stringify(currVal[part]);
      return !areEqual;
    }

    if (!origVal || !origVal.hasOwnProperty(part)) {
      const result = currVal && currVal.hasOwnProperty(part);
      return result;
    }

    if (!currVal || !currVal.hasOwnProperty(part)) {
      return false;
    }

    origVal = origVal[part];
    currVal = currVal[part];
  }

  return false;
};

// Definir los atributos permitidos para actualizar
const ALLOWED_ATTRIBUTES = {
  PROFILE: ["bio", "lore"],
  STYLE: ["all", "chat", "post"],
  KNOWLEDGE: ["knowledge", "topics"],
  MESSAGES: ["messageExamples", "postExamples"],
  ADJECTIVES: ["adjectives"],
};

const applyChanges = (
  originalConfig: AgentPersonalityConfig,
  newConfigData: AgentPersonalityConfig
) => {
  // Crear una copia del objeto original
  const result = JSON.parse(JSON.stringify(originalConfig));

  // Función auxiliar para verificar si una ruta está permitida
  const isAllowedPath = (key: string) => {
    // Manejar propiedades anidadas
    if (key === "style") {
      return true; // Permitimos el objeto style completo para procesarlo después
    }

    return Object.values(ALLOWED_ATTRIBUTES).some((group) =>
      group.includes(key)
    );
  };

  // Solo actualizar los atributos permitidos
  Object.keys(newConfigData).forEach((key) => {
    if (isAllowedPath(key)) {
      if (key === "style" && newConfigData.style) {
        // Manejar el objeto style específicamente
        result.style = {
          ...result.style,
          all: newConfigData.style.all || result.style.all,
          chat: newConfigData.style.chat || result.style.chat,
          post: newConfigData.style.post || result.style.post,
        };
      } else {
        // Para el resto de atributos permitidos
        result[key as keyof AgentPersonalityElizaFormat] =
          newConfigData[key as keyof AgentPersonalityElizaFormat];
      }
    }
  });

  // Asegurarnos de que solo mantenemos los campos permitidos
  const finalResult: Partial<AgentPersonalityElizaFormat> = {};

  // Solo copiar los campos permitidos al resultado final
  Object.entries(ALLOWED_ATTRIBUTES).forEach(([section, attributes]) => {
    attributes.forEach((attr) => {
      if (attr === "all" || attr === "chat" || attr === "post") {
        if (!finalResult.style) {
          finalResult.style = {
            all: [],
            chat: [],
            post: [],
          };
        }
        finalResult.style[attr as "all" | "chat" | "post"] =
          result.style?.[attr as "all" | "chat" | "post"];
      } else {
        finalResult[attr as keyof AgentPersonalityElizaFormat] =
          result[attr as keyof AgentPersonalityElizaFormat];
      }
    });
  });

  console.log("finalResult", finalResult);

  return finalResult as AgentPersonalityElizaFormat;
};

export function ImportFile({ config, setConfig }: ImportFileProps) {
  const [textareaValue, setTextareaValue] = useState("");
  const [changedAttributes, setChangedAttributes] = useState<AttributeTracker>({
    PROFILE: { bio: false, lore: false },
    STYLE: { all: false, chat: false, post: false },
    KNOWLEDGE: { knowledge: false, topics: false },
    MESSAGES: { messageExamples: false, postExamples: false },
  });

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState<string>("");

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.type !== "application/json") {
      setUploadStatus("error");
      setUploadError("Please upload a valid JSON file");
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // Validate the JSON structure here if needed
      if (!json.bio || !json.lore || !json.topics) {
        throw new Error("Invalid JSON structure. Missing required fields.");
      }

      setTextareaValue(JSON.stringify(json, null, 2));
      setUploadStatus("success");
      setUploadError("");
    } catch (error) {
      setUploadStatus("error");
      setUploadError(
        error instanceof Error ? error.message : "Error parsing JSON file"
      );
    }
  };

  useEffect(() => {
    console.log("config", config);
  }, [config]);

  // Update textarea value and original config when config changes
  useEffect(() => {
    setTextareaValue(JSON.stringify(config, null, 2));

    // Save original config when first loaded
  }, [config]);

  // Update changed attributes when textarea value changes
  useEffect(() => {
    try {
      const currentConfig = JSON.parse(textareaValue);
      if (config) {
        // Check each attribute to see if it's changed
        setChangedAttributes({
          PROFILE: {
            bio: hasPathChanged(config, currentConfig, "bio"),
            lore: hasPathChanged(config, currentConfig, "lore"),
          },
          STYLE: {
            all: hasPathChanged(config, currentConfig, "style.all"),
            chat: hasPathChanged(config, currentConfig, "style.chat"),
            post: hasPathChanged(config, currentConfig, "style.post"),
          },
          KNOWLEDGE: {
            knowledge: hasPathChanged(config, currentConfig, "knowledge"),
            topics: hasPathChanged(config, currentConfig, "topics"),
          },
          MESSAGES: {
            messageExamples: hasPathChanged(
              config,
              currentConfig,
              "messageExamples"
            ),
            postExamples: hasPathChanged(config, currentConfig, "postExamples"),
          },
        });
      }
    } catch (error) {
      // If JSON is invalid, don't update changed attributes
    }
  }, [textareaValue, config]);

  const [isApplyingChanges, setIsApplyingChanges] = useState(false);

  const handleApplyChanges = () => {
    try {
      const newConfigData = JSON.parse(textareaValue);
      const updatedConfig = applyChanges(config, newConfigData);

      // Asegurarse de que messageExamples tenga los campos requeridos
      if (updatedConfig.messageExamples) {
        updatedConfig.messageExamples = updatedConfig.messageExamples.map(
          (conversation: any[], convIndex: number) => {
            return conversation.map((message: any, msgIndex: number) => ({
              ...message,
              _conversationId: convIndex,
              _messageIndex: msgIndex,
            }));
          }
        );
      }

      const {
        bio,
        lore,
        style,
        knowledge,
        messageExamples,
        postExamples,
        adjectives,
        topics,
      } = updatedConfig;
      setConfig({
        ...config,
        bio,
        lore,
        style,
        knowledge,
        messageExamples,
        postExamples,
        adjectives,
        topics,
      });
      setUploadError("");
      toast({
        title: "Personality updated",
        description:
          "Your changes have been applied successfully, now you can see the changes in the other tabs",
        variant: "default",
        className:
          "bg-brand-primary/80 border border-brand-border backdrop-blur-sm text-white",
        duration: 3000,
      });
      setIsApplyingChanges(true);
      setTimeout(() => {
        setIsApplyingChanges(false);
      }, 4000);
    } catch (error) {
      setUploadError("Cannot apply: Invalid JSON format");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-sm text-gray-500 mb-4">
        Import a character file to the agent personality. This can be a JSON
        file.
      </p>
      <div
        className={cn(
          "w-full h-64 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer",
          uploadStatus === "idle" &&
            "border-gray-200 hover:border-blue-200 hover:bg-blue-50/30",
          uploadStatus === "success" && "border-green-200 bg-green-50/30",
          uploadStatus === "error" && "border-red-200 bg-red-50/30"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer.files[0];
          await handleFileUpload(file);
        }}
      >
        {uploadStatus === "idle" && (
          <>
            <FileJson className="w-12 h-12 text-gray-400 group-hover:text-blue-400 transition-colors" />
            <input
              type="file"
              accept=".json"
              className="hidden"
              id="json-upload"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  console.log("Uploading file");
                  await handleFileUpload(file);
                }
              }}
            />
            <label
              htmlFor="json-upload"
              className="px-4 py-2 rounded-xl text-sm font-medium text-blue-600
                 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Select file
            </label>
          </>
        )}

        {uploadStatus === "success" && (
          <div className="text-center flex flex-col items-center justify-center gap-4">
            <Check className="w-12 h-12 text-green-500 mb-2" />
            <p className="text-green-600 mb-4">
              JSON file uploaded successfully!
            </p>
            <button
              onClick={() => {
                setUploadStatus("idle");
                setUploadError("");
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-blue-600
           bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              Upload another file
            </button>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="text-center flex flex-col items-center justify-center gap-4">
            <X className="w-12 h-12 text-red-500 mb-2" />
            <p className="text-red-600 mb-2">Error uploading JSON file</p>
            <p className="text-red-500/70 text-sm mb-4">{uploadError}</p>
            <button
              onClick={() => {
                setUploadStatus("idle");
                setUploadError("");
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-blue-600
           bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {uploadStatus === "success" && (
        <div className="mt-8 w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Preview</h3>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Reset to the original config
                  if (config) {
                    setTextareaValue(JSON.stringify(config, null, 2));
                  }
                  setUploadError("");
                }}
                className="px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600
                bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleApplyChanges}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-sm font-medium text-white",
                  isApplyingChanges
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700 transition-colors"
                )}
              >
                {isApplyingChanges ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <p>Success</p>
                  </div>
                ) : (
                  "Apply"
                )}
              </button>
            </div>
          </div>
          <div className="flex gap-6 max-w-[1200px]">
            <div className="flex-1">
              <textarea
                className="w-full bg-white p-4 rounded-xl text-gray-900 font-mono text-sm min-h-[400px] resize-y
             border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)]
             focus:border-blue-200 focus:ring-1 focus:ring-blue-200 focus:outline-none"
                value={textareaValue}
                onChange={(e) => {
                  setTextareaValue(e.target.value);
                  try {
                    JSON.parse(e.target.value);
                    setUploadError("");
                  } catch (error) {
                    setUploadError("Invalid JSON format");
                  }
                }}
              />
              {uploadError && (
                <p className="text-red-500 text-sm mt-2">{uploadError}</p>
              )}
            </div>

            <div className="w-[300px]">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-full overflow-y-auto max-h-[400px]">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Changes to Apply
                </h4>

                {/* PROFILE section */}
                <div className="mb-4">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    PROFILE
                  </h5>
                  <ul className="space-y-1">
                    <li className="flex items-center">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          changedAttributes.PROFILE.bio
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        )}
                      ></div>
                      <span
                        className={cn(
                          "text-sm",
                          changedAttributes.PROFILE.bio
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        )}
                      >
                        Bio
                      </span>
                    </li>
                    <li className="flex items-center">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          changedAttributes.PROFILE.lore
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        )}
                      ></div>
                      <span
                        className={cn(
                          "text-sm",
                          changedAttributes.PROFILE.lore
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        )}
                      >
                        Lore
                      </span>
                    </li>
                  </ul>
                </div>

                {/* STYLE section */}
                <div className="mb-4">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    STYLE
                  </h5>
                  <ul className="space-y-1">
                    <li className="flex items-center">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          changedAttributes.STYLE.all
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        )}
                      ></div>
                      <span
                        className={cn(
                          "text-sm",
                          changedAttributes.STYLE.all
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        )}
                      >
                        All
                      </span>
                    </li>
                    <li className="flex items-center">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          changedAttributes.STYLE.chat
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        )}
                      ></div>
                      <span
                        className={cn(
                          "text-sm",
                          changedAttributes.STYLE.chat
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        )}
                      >
                        Chat
                      </span>
                    </li>
                    <li className="flex items-center">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          changedAttributes.STYLE.post
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        )}
                      ></div>
                      <span
                        className={cn(
                          "text-sm",
                          changedAttributes.STYLE.post
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        )}
                      >
                        Post
                      </span>
                    </li>
                  </ul>
                </div>

                {/* KNOWLEDGE section */}
                <div className="mb-4">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    KNOWLEDGE
                  </h5>
                  <ul className="space-y-1">
                    <li className="flex items-center">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          changedAttributes.KNOWLEDGE.knowledge
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        )}
                      ></div>
                      <span
                        className={cn(
                          "text-sm",
                          changedAttributes.KNOWLEDGE.knowledge
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        )}
                      >
                        Knowledge
                      </span>
                    </li>
                    <li className="flex items-center">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          changedAttributes.KNOWLEDGE.topics
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        )}
                      ></div>
                      <span
                        className={cn(
                          "text-sm",
                          changedAttributes.KNOWLEDGE.topics
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        )}
                      >
                        Topics
                      </span>
                    </li>
                  </ul>
                </div>

                {/* MESSAGES section */}
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    MESSAGES
                  </h5>
                  <ul className="space-y-1">
                    <li className="flex items-center">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          changedAttributes.MESSAGES.messageExamples
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        )}
                      ></div>
                      <span
                        className={cn(
                          "text-sm",
                          changedAttributes.MESSAGES.messageExamples
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        )}
                      >
                        Message Examples
                      </span>
                    </li>
                    <li className="flex items-center">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          changedAttributes.MESSAGES.postExamples
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        )}
                      ></div>
                      <span
                        className={cn(
                          "text-sm",
                          changedAttributes.MESSAGES.postExamples
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        )}
                      >
                        Post Examples
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
