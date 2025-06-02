// React
import { useCallback, useEffect, useState } from "react";

// Next
import Image from "next/image";

// Types
import { Agent } from "@/types/agent.model";

// React Flow
import {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Node,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Shadcn components
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";
import { Textarea } from "@/components/shadcn/textarea";
import { Switch } from "@/components/shadcn/switch";
import { Checkbox } from "@/components/shadcn/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
// Components
import { KnowledgeNode } from "@/components/AgentDashboard/KnowledgeNode";

// Icons
import {
  Bot,
  Edit,
  FileUp,
  Globe,
  Plus,
  Save,
  X,
  RefreshCw,
} from "lucide-react";

// Utils
import {
  formatMarkdownContent,
  getKnowledgeContent,
} from "@/utils/format-knowledge";
import axios from "axios";
import Link from "next/link";

const initialEdges: Edge[] = [];

const nodeTypes = {
  knowledge: KnowledgeNode,
};

const centerX = 500;
const centerY = 300;
const baseRadius = 250;
const singleNodeRadius = 150;

export function KnowledgeChart({
  agent,
  refetchAgent,
}: {
  agent: Agent;
  refetchAgent: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [knowledgeType, setKnowledgeType] = useState<
    "web" | "pdf" | "farcaster"
  >("web");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedKnowledge, setSelectedKnowledge] = useState<{
    id: string;
    url: string;
    data?: any;
    lastUpdated?: string;
    type?: string;
    isDynamic?: boolean;
  } | null>(null);
  const [newFarcasterAccount, setNewFarcasterAccount] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedKnowledgeCache, setEditedKnowledgeCache] = useState<
    Record<string, any>
  >({});
  const [isDynamicKnowledge, setIsDynamicKnowledge] = useState(false);
  const [showScrapingInstructions, setShowScrapingInstructions] =
    useState(false);
  const [scrapingInstructions, setScrapingInstructions] = useState("");

  const agentNodeId = "agent-node";

  const initialNodes: Node[] = [
    {
      id: agentNodeId,
      type: "default",
      position: { x: centerX, y: centerY },
      data: {
        label: (
          <div className="flex flex-col items-center justify-center gap-2">
            <Bot className="w-8 h-8 text-blue-500" />

            <span className="font-medium text-sm">
              {agent?.name || "Agent"}
            </span>
          </div>
        ),
      },
      style: {
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        border: "2px solid #3b82f6",
        borderRadius: "12px",
        width: 150,
        height: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleAddKnowledge = async (
    url: string,
    type: "web" | "pdf" | "farcaster" = "web",
    file?: File,
    isDynamic?: boolean,
    instructions?: string
  ) => {
    if (type === "web") {
      if (!agent.agentId) {
        console.error("🤖 Agent ID is missing, cannot add web knowledge.");
        return null;
      }
      const response = await axios.post(`/api/knowledge`, {
        url,
        type,
        isDynamic,
        instructions,
        agentId: agent.agentId,
      });

      if (response.status !== 200) {
        console.error("🤖 Error adding knowledge", response);
        return null;
      }
      const data = response.data;
      return data.scrapedData;
    } else if (type === "pdf" && file) {
      console.log("🤖 Adding PDF knowledge", {
        agentId: agent.agentId,
        type,
        file,
      });
      const formData = new FormData();
      formData.append("agentId", agent.agentId || "");
      formData.append("type", type);
      formData.append("file", file);

      const response = await fetch("/api/knowledge-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("🤖 Error adding PDF knowledge", response);
      }

      return response;
    } else if (type === "farcaster") {
      console.log("🤖 Adding Farcaster knowledge", {
        agentId: agent.agentId,
        type,
        newFarcasterAccount,
      });
    }
  };

  const handleRefreshKnowledge = async (
    knowledgeUrl: string,
    nodeId: string
  ) => {
    try {
      console.log("🤖 Refreshing web knowledge via API:", knowledgeUrl);
      setProcessingNodes((prev) => ({ ...prev, [nodeId]: true }));
      const response = await axios.put("/api/knowledge", {
        agentId: agent.agentId,
        url: knowledgeUrl,
      });

      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData.error || "Failed to refresh knowledge");
      }

      const result = response.data;
      console.log("🔄 Knowledge refreshed successfully:", result);

      setNodes((nds) =>
        nds.map((node) =>
          node.id === knowledgeUrl
            ? {
                ...node,
                data: {
                  ...node.data,
                  status: "completed",
                  response: result.refreshedData,
                },
              }
            : node
        )
      );
      refetchAgent(); // Actualizar la info general del agente y sus conocimientos
    } catch (error) {
      console.error("Error refreshing knowledge:", error);
      setNodes((nds) =>
        nds.map((node) =>
          node.id === knowledgeUrl
            ? {
                ...node,
                data: {
                  ...node.data,
                  status: "error",
                  error: error instanceof Error ? error.message : String(error),
                },
              }
            : node
        )
      );
    } finally {
      setProcessingNodes((prev) => ({ ...prev, [nodeId]: false }));
    }
  };

  const handleDeleteKnowledge = async (knowledgeUrl: string) => {
    const nodeToDelete = nodes.find((node) => node.data.label === knowledgeUrl);
    const nodeIdToDelete = nodeToDelete?.id;
    const nodeType = nodeToDelete?.data.type;

    setNodes((nds) => nds.filter((node) => node.data.label !== knowledgeUrl));

    if (nodeIdToDelete) {
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeIdToDelete));
    }

    if (nodeType === "farcaster") {
      console.log("🤖 Deleting Farcaster knowledge", knowledgeUrl);
      return;
    }

    try {
      const response = await fetch("/api/knowledge", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: agent.agentId,
          url: knowledgeUrl,
        }),
      });

      if (!response.ok) {
        console.error("🤖 Error deleting knowledge", response);
        return;
      }
    } catch (error) {
      console.error("Error deleting knowledge:", error);
    }
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (node.type === "knowledge") {
      const cachedData = editedKnowledgeCache[node.data.label as string];

      if (cachedData) {
        setSelectedKnowledge({
          id: node.id,
          url: node.data.label as string,
          data: cachedData,
        });
        return;
      }

      const knowledgeItem = agent?.knowledge?.find(
        (item) => item.url === node.data.label
      );

      if (knowledgeItem) {
        setSelectedKnowledge({
          id: node.id,
          url: knowledgeItem.url,
          data: knowledgeItem.data,
          lastUpdated: knowledgeItem.lastUpdated,
          type: knowledgeItem.type,
          isDynamic: knowledgeItem.isDynamic,
        });
      }
    }
  };

  const [processingNodes, setProcessingNodes] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const knowledgeItems = agent?.knowledge || [];
    const totalItems = knowledgeItems.length;

    if (totalItems > 0) {
      const radius = totalItems === 1 ? singleNodeRadius : baseRadius;
      const angleOffset = totalItems === 1 ? Math.PI / 2 : 0;

      const knowledgeNodes: Node[] = knowledgeItems.map((item, index) => {
        let x, y;

        if (totalItems === 1) {
          x = centerX;
          y = centerY - singleNodeRadius;
        } else if (totalItems === 2) {
          const offset = 100;
          x = centerX + (index === 0 ? -offset : offset);
          y = centerY - singleNodeRadius;
        } else if (totalItems === 3) {
          const offset = 180;
          x = centerX + (index === 0 ? -offset : index === 1 ? 0 : offset);
          y = centerY - singleNodeRadius;
        } else {
          const angle = angleOffset + (2 * Math.PI * index) / totalItems;
          x = centerX + radius * Math.cos(angle);
          y = centerY + radius * Math.sin(angle);
        }

        const nodeId = `knowledge-${index}`;
        return {
          id: nodeId,
          type: "knowledge",
          position: { x, y },
          data: {
            label: item.url,
            type: item.type,
            status: item.status,
            knowledgeId: item.url,
            onDelete: handleDeleteKnowledge,
            onRefresh: handleRefreshKnowledge,
            isDynamic: item.isDynamic,
            lastUpdated: item.lastUpdated,
          },
          sourcePosition: Position.Top,
          targetPosition: Position.Bottom,
        };
      });

      const knowledgeEdges: Edge[] = knowledgeItems.map((item, index) => {
        const sourceNodeId = `knowledge-${index}`;
        return {
          id: `edge-${sourceNodeId}-to-${agentNodeId}`,
          source: sourceNodeId,
          target: agentNodeId,
          animated: true,
          style: { strokeDasharray: "5,5", stroke: "#aaa" },
        };
      });

      setNodes([initialNodes[0], ...knowledgeNodes]);
      const edgeIdsToDelete = knowledgeItems
        .map((_, index) => `knowledge-${index}`)
        .filter((nodeId) => !knowledgeNodes.some((kn) => kn.id === nodeId));

      const filteredEdges = knowledgeEdges.filter(
        (edge) => !edgeIdsToDelete.includes(edge.source)
      );

      setEdges(filteredEdges);
    } else {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [agent?.knowledge, agent?.name]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { strokeDasharray: "5,5", stroke: "#aaa" },
          },
          eds
        )
      ),
    [setEdges]
  );

  const addNewNode = useCallback(
    (label: string, tempId: string, status: string, type: string) => {
      if (!label.trim()) return;

      const newEdge: Edge = {
        id: `edge-${tempId}-to-${agentNodeId}`,
        source: tempId,
        target: agentNodeId,
        animated: true,
        style: {
          strokeDasharray: "5,5",
          stroke: type === "farcaster" ? "#8A63D2" : "#aaa",
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));

      setNodes((nds) => {
        const currentKnowledgeNodes = nds.filter((n) => n.id !== agentNodeId);
        const futureIndex = currentKnowledgeNodes.length;
        const totalItemsIncludingNew = futureIndex + 1;

        const radius =
          totalItemsIncludingNew === 1 ? singleNodeRadius : baseRadius;
        const angleOffset = totalItemsIncludingNew === 1 ? Math.PI / 2 : 0;

        let x, y;

        if (totalItemsIncludingNew === 1) {
          x = centerX;
          y = centerY - singleNodeRadius;
        } else if (totalItemsIncludingNew === 2) {
          const offset = 100;
          x = centerX + (futureIndex === 0 ? -offset : offset);
          y = centerY - singleNodeRadius;
        } else if (totalItemsIncludingNew === 3) {
          const offset = 150;
          x =
            centerX +
            (futureIndex === 0 ? -offset : futureIndex === 1 ? 0 : offset);
          y = centerY - singleNodeRadius;
        } else {
          const angle =
            angleOffset + (2 * Math.PI * futureIndex) / totalItemsIncludingNew;
          x = centerX + radius * Math.cos(angle);
          y = centerY + radius * Math.sin(angle);
        }

        const newNode: Node = {
          id: tempId,
          type: "knowledge",
          position: { x, y },
          data: {
            label: label,
            type: type,
            status: status,
            knowledgeId: label,
            onDelete: handleDeleteKnowledge,
            onRefresh: handleRefreshKnowledge,
            isDynamic: type === "web" ? isDynamicKnowledge : false,
          },
          sourcePosition: Position.Top,
          targetPosition: Position.Bottom,
        };

        return [...nds, newNode];
      });
    },
    [setNodes, setEdges, agentNodeId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (knowledgeType === "web" && !newUrl.trim()) return;
    if (knowledgeType === "pdf" && !selectedFile) return;
    if (knowledgeType === "farcaster" && !newFarcasterAccount.trim()) return;

    const tempId = `knowledge-temp-${Date.now()}`;
    const label =
      knowledgeType === "web"
        ? newUrl
        : knowledgeType === "pdf"
        ? selectedFile?.name || ""
        : newFarcasterAccount;

    addNewNode(
      label,
      tempId,
      knowledgeType === "farcaster" ? "processing" : "processing",
      knowledgeType
    );

    setProcessingNodes((prev) => ({ ...prev, [tempId]: true }));

    setNewUrl("");
    setSelectedFile(null);
    setNewFarcasterAccount("");
    setShowAddForm(false);
    setIsDynamicKnowledge(false);
    setShowScrapingInstructions(false);
    setScrapingInstructions("");

    if (knowledgeType === "farcaster") {
      const response = await fetch("/api/knowledge-farcaster", {
        method: "POST",
        body: JSON.stringify({
          agentId: agent.agentId,
          farcasterAccount: newFarcasterAccount,
        }),
      });

      if (!response.ok) {
        console.error("🤖 Error adding Farcaster knowledge", response);
        setNodes((nds) =>
          nds.map((node) =>
            node.id === tempId
              ? { ...node, data: { ...node.data, status: "error" } }
              : node
          )
        );
      } else {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === tempId
              ? { ...node, data: { ...node.data, status: "completed" } }
              : node
          )
        );

        setEdges((eds) =>
          eds.map((edge) =>
            edge.source === tempId
              ? {
                  ...edge,
                  style: { strokeDasharray: "5,5", stroke: "#8A63D2" },
                }
              : edge
          )
        );
      }

      setProcessingNodes((prev) => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });

      return;
    }

    try {
      const response = await handleAddKnowledge(
        label,
        knowledgeType,
        knowledgeType === "pdf" ? selectedFile || undefined : undefined,
        knowledgeType === "web" ? isDynamicKnowledge : undefined,
        knowledgeType === "web" && showScrapingInstructions
          ? scrapingInstructions
          : undefined
      );

      if (response) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === tempId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    response,
                    status: "completed",
                  },
                }
              : node
          )
        );
        refetchAgent();
      } else {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === tempId
              ? {
                  ...node,
                  data: { ...node.data, status: "error", response: null },
                }
              : node
          )
        );
        refetchAgent();
      }
    } catch (error) {
      console.error("Error adding knowledge:", error);
      setNodes((nds) =>
        nds.map((node) =>
          node.id === tempId
            ? { ...node, data: { ...node.data, status: "error" } }
            : node
        )
      );
      refetchAgent();
    } finally {
      setProcessingNodes((prev) => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartEditing = () => {
    setEditedContent(getKnowledgeContent(selectedKnowledge));
    setIsEditing(true);
  };

  const handleSaveEditing = async () => {
    const previousState = selectedKnowledge;
    const newContent = editedContent;

    if (selectedKnowledge) {
      let updatedData = { ...selectedKnowledge.data };

      if (typeof updatedData === "string") {
        updatedData = newContent;
      } else if (updatedData.content) {
        updatedData.content = newContent;
      } else if (updatedData.text) {
        updatedData.text = newContent;
      } else if (updatedData.body) {
        updatedData.body = newContent;
      } else {
        updatedData.content = newContent;
      }

      setSelectedKnowledge({
        ...selectedKnowledge,
        data: updatedData,
      });

      setEditedKnowledgeCache((prev) => ({
        ...prev,
        [selectedKnowledge.url]: updatedData,
      }));
    }
    setIsEditing(false);

    try {
      const response = await fetch("/api/knowledge-edit", {
        method: "POST",
        body: JSON.stringify({
          agentId: agent.agentId,
          url: selectedKnowledge?.url,
          newData: newContent,
        }),
      });

      if (!response.ok) {
        console.error("Error editing knowledge:", await response.text());
        setSelectedKnowledge(previousState);
        if (selectedKnowledge) {
          setEditedKnowledgeCache((prev) => {
            const newCache = { ...prev };
            delete newCache[selectedKnowledge.url];
            return newCache;
          });
        }
      }
    } catch (error) {
      console.error("Error editing knowledge:", error);
      setSelectedKnowledge(previousState);
      if (selectedKnowledge) {
        setEditedKnowledgeCache((prev) => {
          const newCache = { ...prev };
          delete newCache[selectedKnowledge.url];
          return newCache;
        });
      }
    }
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <h2 className="text-3xl font-bold text-center mt-2">Knowledge Base</h2>
      <p className="text-gray-600 text-left mb-2 self-start px-4">
        The knowledge base allows your agent to access information from
        websites, PDF files and Farcaster accounts to provide more accurate and
        contextualized responses.
      </p>

      <div className="h-[600px] w-full relative border rounded-lg overflow-hidden shadow-sm bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
        </ReactFlow>

        <div className="absolute bottom-4 right-4 z-10">
          {showAddForm ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-blue-200">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <Tabs
                  defaultValue="web"
                  value={knowledgeType}
                  onValueChange={(value) =>
                    setKnowledgeType(value as "web" | "pdf")
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 mb-2">
                    <TabsTrigger
                      value="web"
                      className="flex items-center gap-1"
                    >
                      <Globe className="w-4 h-4" />
                      Web
                    </TabsTrigger>

                    <TabsTrigger
                      value="pdf"
                      className="flex items-center gap-1"
                    >
                      <FileUp className="w-4 h-4" />
                      PDF
                    </TabsTrigger>

                    <TabsTrigger
                      value="farcaster"
                      className="flex items-center gap-1"
                    >
                      <Image
                        src="/assets/farcaster.svg"
                        alt="Farcaster"
                        width={16}
                        height={16}
                      />
                      Farcaster account
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="web" className="mt-0">
                    <div className="flex items-center gap-2">
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="w-full"
                        autoFocus={knowledgeType === "web"}
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-2 h-auto"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-info"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                              </svg>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="w-auto"
                            align="start"
                          >
                            <p className="text-sm">
                              Scraping and adding to the knowledge base can take
                              between 2 and 7 minutes.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <Switch
                        id="knowledge-dynamic-switch"
                        checked={isDynamicKnowledge}
                        onCheckedChange={setIsDynamicKnowledge}
                        disabled={Object.keys(processingNodes).length > 0}
                      />
                      <Label htmlFor="knowledge-dynamic-switch">
                        {isDynamicKnowledge
                          ? "Dynamic Data (e.g., CoinMarketCap Prices)"
                          : "Static Data (e.g., Paragraphs Article)"}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <Checkbox
                        id="add-instructions-checkbox"
                        checked={showScrapingInstructions}
                        onCheckedChange={(checked: boolean | "indeterminate") =>
                          setShowScrapingInstructions(Boolean(checked))
                        }
                        disabled={Object.keys(processingNodes).length > 0}
                      />
                      <Label htmlFor="add-instructions-checkbox">
                        Add custom scraping instructions
                      </Label>
                    </div>
                    {showScrapingInstructions && (
                      <Textarea
                        placeholder="e.g., Focus only on the main article content, ignore sidebars and comments."
                        value={scrapingInstructions}
                        onChange={(e) =>
                          setScrapingInstructions(e.target.value)
                        }
                        className="mt-2 h-24"
                        disabled={Object.keys(processingNodes).length > 0}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="pdf" className="mt-0">
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center w-full">
                      {selectedFile ? (
                        <div className="flex flex-col items-center">
                          <p className="text-sm text-gray-600 truncate max-w-[250px]">
                            {selectedFile.name}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFile(null)}
                            className="mt-2"
                          >
                            Change file
                          </Button>
                        </div>
                      ) : (
                        <>
                          <FileUp className="h-8 w-8 text-gray-400 mb-2" />
                          <Label
                            htmlFor="pdf-upload"
                            className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer font-medium"
                          >
                            Select or drag and drop a PDF
                          </Label>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF (max. 10MB)
                          </p>
                        </>
                      )}
                      <input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="farcaster" className="mt-0">
                    <div className="flex flex-col gap-2">
                      <Input
                        type="text"
                        placeholder="handle (without @) or FID"
                        value={newFarcasterAccount}
                        onChange={(e) => setNewFarcasterAccount(e.target.value)}
                        className="w-full"
                        autoFocus={knowledgeType === "farcaster"}
                      />
                      <p className="text-xs text-gray-500">
                        Enter the Farcaster username without the @ or the FID.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={
                      (knowledgeType === "web" && !newUrl.trim()) ||
                      (knowledgeType === "pdf" && !selectedFile) ||
                      Object.keys(processingNodes).length > 0
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {Object.keys(processingNodes).length > 0
                      ? "Processing..."
                      : "Add"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    disabled={Object.keys(processingNodes).length > 0}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add knowledge
            </Button>
          )}
        </div>
      </div>

      <Dialog
        open={!!selectedKnowledge}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedKnowledge(null);
            setIsEditing(false);
            setEditedContent("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Knowledge Source</span>
              <div className="flex items-center gap-1">
                {selectedKnowledge &&
                  selectedKnowledge.type === "website" &&
                  selectedKnowledge.isDynamic && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        handleRefreshKnowledge(
                          selectedKnowledge.url,
                          selectedKnowledge.id
                        )
                      }
                      disabled={processingNodes[selectedKnowledge.id]}
                      title="Refresh knowledge"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          processingNodes[selectedKnowledge.id]
                            ? "animate-spin"
                            : ""
                        }`}
                      />
                    </Button>
                  )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setSelectedKnowledge(null);
                    setIsEditing(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>

            <DialogDescription className="flex flex-col gap-2">
              <div className="flex gap-2">
                <span className="text-sm font-medium">Source: </span>
                <Link
                  href={selectedKnowledge?.url || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {selectedKnowledge?.url}
                </Link>
              </div>

              <div className="flex gap-2">
                {selectedKnowledge?.lastUpdated && (
                  <span className="text-xs text-gray-500">
                    Last updated:{" "}
                    {new Date(selectedKnowledge.lastUpdated).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col h-[calc(70vh-120px)]">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              Summary:
            </h3>
            <div className="flex-grow bg-gray-50 p-4 rounded-md border overflow-y-auto">
              {selectedKnowledge?.data ? (
                isEditing ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[300px] h-full w-full font-mono text-sm resize-none"
                  />
                ) : selectedKnowledge?.data?.type === "farcaster" ||
                  nodes.find((node) => node.id === selectedKnowledge?.id)?.data
                    ?.type === "farcaster" ? (
                  <div className="space-y-4">
                    {agent.knowledge
                      ?.find((k) => k.url === selectedKnowledge.url)
                      ?.data?.casts?.map((cast: any, index: number) => (
                        <div
                          key={cast.hash}
                          className="border rounded-lg p-3 bg-white hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            if (cast.hash && cast.author?.username) {
                              window.open(
                                `https://warpcast.com/${cast.author.username}/${cast.hash}`,
                                "_blank"
                              );
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-medium">
                              {cast.author?.username || "Usuario"}
                            </div>

                            <div className="text-xs text-gray-500">
                              {new Date(cast.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-sm mb-2">{cast.text}</p>
                          {cast.embeds && cast.embeds.length > 0 && (
                            <div className="mb-3">
                              {cast.embeds.map(
                                (embed: any, embedIndex: number) => (
                                  <div key={embedIndex}>
                                    {embed.url &&
                                      embed.url.includes("image") && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={embed.url}
                                          alt="Imagen embebida"
                                          className="rounded-md max-h-64 my-2"
                                        />
                                      )}
                                    {embed.url &&
                                      !embed.url.includes("image") &&
                                      embed.metadata?.image && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={embed.metadata.image}
                                          alt={
                                            embed.metadata.title ||
                                            "Imagen enlazada"
                                          }
                                          className="rounded-md max-h-64 my-2"
                                        />
                                      )}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                          <div className="flex gap-4 text-xs text-gray-600">
                            <span>💬 {cast.replies?.count || 0} comments</span>

                            <span>
                              ❤️ {cast.reactions?.likes_count || 0} likes
                            </span>

                            <span>
                              🦾 {cast.reactions?.recasts_count || 0} recasts
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="markdown-styled">
                    {formatMarkdownContent(
                      getKnowledgeContent(selectedKnowledge)
                    )}
                  </div>
                )
              ) : (
                <p className="text-gray-500 italic">
                  No data available for this knowledge.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center border-t pt-4">
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEditing}
                  className="flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>

                <Button variant="outline" onClick={handleCancelEditing}>
                  Cancel
                </Button>
              </div>
            ) : (
              selectedKnowledge?.data &&
              selectedKnowledge?.data?.type !== "farcaster" &&
              nodes.find((node) => node.id === selectedKnowledge?.id)?.data
                ?.type !== "farcaster" && (
                <Button
                  onClick={handleStartEditing}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit content
                </Button>
              )
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
