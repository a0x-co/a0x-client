// React
import { useState, useEffect, useCallback, CSSProperties } from "react";

// React Flow
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Icons
import { Play, Loader2, Check, X, Award } from "lucide-react";

// Types
import { Agent } from "@/types/agent.model";

// Details
import {
  initialNodes,
  initialEdges,
  executingStyle,
  completedStyle,
  CustomNodeData as ImportedCustomNodeData,
  executionOrder,
} from "./details";

// Shadcn components
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/shadcn/dialog";

type CryptoToken = "USDC" | "A0X" | "WETH";

interface GrantWinner {
  name: string;
  githubRepo: string;
  walletAddress: string;
  payoutAmount: number;
  payoutToken: CryptoToken;
  score: number;
  selectionReason: string;
}

interface CustomNodeDataWithIndex extends ImportedCustomNodeData {
  [key: string]: any;
}

interface WinnerNodeDataWithIndex extends CustomNodeDataWithIndex {
  winnerData: GrantWinner;
  isWinnerNode: true;
}

type FlowNodeData = CustomNodeDataWithIndex | WinnerNodeDataWithIndex;

const grantWinners: GrantWinner[] = [
  {
    name: "Project Alpha",
    githubRepo: "https://github.com/project-alpha",
    walletAddress: "0x1234567890123456789012345678901234567890",
    payoutAmount: 10,
    payoutToken: "A0X",
    score: 9.5,
    selectionReason:
      "Innovative solution aligned with BASE ecosystem objectives.",
  },
  {
    name: "Project Beta",
    githubRepo: "https://github.com/project-beta",
    walletAddress: "0x1234567890123456789012345678901234567890",
    payoutAmount: 5,
    payoutToken: "USDC",
    score: 9.5,
    selectionReason: "Very good UX",
  },
];

const nodeTypes = {
  default: ({ data }: NodeProps<any>) => {
    const isWinner = data.isWinnerNode === true;

    return (
      <>
        {data.isExecuting && (
          <div
            className="absolute -top-2 -right-2 flex items-center bg-white border border-gray-300 rounded-full px-2 py-0.5 text-xs shadow"
            style={{ zIndex: 10 }}
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
            Running
          </div>
        )}

        {data.isCompleted && !data.isExecuting && (
          <div
            className="absolute -top-2 -right-2 flex items-center bg-white border border-green-300 rounded-full px-2 py-0.5 text-xs shadow"
            style={{ zIndex: 10 }}
          >
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
            Completed
          </div>
        )}

        <Handle
          type="target"
          position={Position.Top}
          style={{ background: "transparent", border: "none" }}
        />
        <div className="flex items-center justify-center h-full p-2 relative">
          {isWinner ? <Award className="w-5 h-5 text-yellow-500" /> : data.icon}
          <span
            className={`text-sm font-semibold ml-2 ${
              isWinner ? "text-yellow-700" : ""
            }`}
          >
            {data.label}
          </span>{" "}
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: "transparent", border: "none" }}
        />
      </>
    );
  },
};

export function ManualActions({ agent }: { agent: Agent }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNodeData>>(
    initialNodes as Node<FlowNodeData>[]
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [status, setStatus] = useState<"idle" | "executing" | "completed">(
    "idle"
  );
  const [currentNodeIndex, setCurrentNodeIndex] = useState<number | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<GrantWinner | null>(
    null
  );

  const getBaseStyle = useCallback((nodeId: string): CSSProperties => {
    const typedInitialNodes = initialNodes as Node<FlowNodeData>[];
    const node = typedInitialNodes.find((n) => n.id === nodeId);
    return node?.style || {};
  }, []);

  const updateNodeState = useCallback(
    (
      nodeId: string,
      styleUpdate: CSSProperties,
      isExecuting: boolean = false,
      isCompleted: boolean | null = null
    ) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const baseStyle = getBaseStyle(nodeId);
            const currentData = node.data;
            const newCompletedStatus =
              isCompleted === null ? currentData.isCompleted : isCompleted;
            return {
              ...node,
              style: { ...baseStyle, ...styleUpdate },
              data: {
                ...currentData,
                isExecuting,
                isCompleted: newCompletedStatus,
              },
            };
          } else {
            if (node.data.isExecuting && node.id !== nodeId) {
              return { ...node, data: { ...node.data, isExecuting: false } };
            }
          }
          return node;
        })
      );
    },
    [setNodes, getBaseStyle]
  );

  const resetNodes = useCallback(() => {
    const typedInitialNodes = initialNodes as Node<CustomNodeDataWithIndex>[];
    setNodes(
      typedInitialNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isExecuting: false,
          isCompleted: false,
        } as CustomNodeDataWithIndex,
        style: getBaseStyle(n.id),
      }))
    );
    setEdges(initialEdges);
  }, [setNodes, setEdges, getBaseStyle]);

  useEffect(() => {
    if (status === "executing" && currentNodeIndex === null) {
      resetNodes();
      setCurrentNodeIndex(0);
    } else if (status === "idle") {
      setCurrentNodeIndex(null);
    }
  }, [status, currentNodeIndex, resetNodes]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined = undefined;
    if (status === "executing" && currentNodeIndex !== null) {
      const currentNodeId = executionOrder[currentNodeIndex];
      const previousNodeId =
        currentNodeIndex > 0 ? executionOrder[currentNodeIndex - 1] : null;

      if (previousNodeId) {
        updateNodeState(previousNodeId, completedStyle, false, true);
      }

      updateNodeState(currentNodeId, executingStyle, true, false);

      timer = setTimeout(() => {
        const nextIndex = currentNodeIndex + 1;
        if (nextIndex < executionOrder.length) {
          setCurrentNodeIndex(nextIndex);
        } else {
          updateNodeState(currentNodeId, completedStyle, false, true);
          setStatus("completed");

          setNodes((currentNodes) => {
            const lastFlowNode = currentNodes.find(
              (n) => n.id === currentNodeId
            );
            const startX = lastFlowNode ? lastFlowNode.position.x + 250 : 800;
            const startY = lastFlowNode ? lastFlowNode.position.y - 100 : 200;
            const winnerNodes: Node<WinnerNodeDataWithIndex>[] =
              grantWinners.map((winner, index) => ({
                id: `winner-${index}`,
                type: "default",
                position: { x: startX, y: startY + index * 80 },
                data: {
                  label: winner.name,
                  icon: <Award className="w-5 h-5 text-yellow-500" />,
                  isExecuting: false,
                  isCompleted: true,
                  winnerData: winner,
                  isWinnerNode: true,
                },
                style: {
                  background: "#FFFBEB",
                  border: "1px solid #FBBF24",
                  borderRadius: "8px",
                  width: 180,
                  height: 50,
                },
              }));
            return [...currentNodes, ...winnerNodes];
          });

          setEdges((currentEdges) => {
            const winnerEdges: Edge[] = grantWinners.map((_, index) => ({
              id: `edge-${currentNodeId}-winner-${index}`,
              source: currentNodeId,
              target: `winner-${index}`,
              animated: false,
              style: { stroke: "#FBBF24", strokeWidth: 2 },
            }));
            return [...currentEdges, ...winnerEdges];
          });
        }
      }, 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [
    status,
    currentNodeIndex,
    updateNodeState,
    setNodes,
    setEdges,
    executionOrder,
  ]);

  const handleExecuteClick = () => {
    if (status === "idle") {
      setStatus("executing");
    }
  };

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node<FlowNodeData>) => {
      if (node.data.isWinnerNode === true) {
        setSelectedWinner(
          (node.data as unknown as WinnerNodeDataWithIndex).winnerData
        );
      }
    },
    []
  );

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <h2 className="text-3xl font-bold text-center mt-2">Manual Actions</h2>

      <p className="text-gray-600 text-left mb-2 self-start px-4">
        The manual actions allow you to manually interact with your agent. This
        happens when an action involves a human in the loop.
      </p>

      <div className="h-[600px] w-full relative border rounded-lg overflow-hidden shadow-sm bg-gray-50">
        <ReactFlow
          nodes={nodes as Node[]}
          edges={edges}
          onNodesChange={onNodesChange as any}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes as any}
          onNodeClick={handleNodeClick as any}
          fitView
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          panOnScroll={false}
          panOnDrag={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
        </ReactFlow>

        <div className="absolute bottom-4 right-4 z-10">
          <button
            className={`font-bold py-2 px-4 rounded flex items-center justify-center w-[200px] transition-colors duration-200 ${
              status === "executing"
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : status === "completed"
                ? "bg-blue-500 text-white cursor-not-allowed"
                : "bg-green-500 hover:bg-green-700 text-black"
            }`}
            onClick={handleExecuteClick}
            disabled={status === "executing" || status === "completed"}
          >
            {status === "executing" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : status === "completed" ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {status === "executing"
              ? "Executing..."
              : status === "completed"
              ? "Completed"
              : "Execute action"}
          </button>
        </div>
      </div>

      <Dialog
        open={!!selectedWinner}
        onOpenChange={(open) => !open && setSelectedWinner(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Grant Winner Details</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedWinner(null)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>

            <DialogDescription>
              Details for the selected grant winner project.
            </DialogDescription>
          </DialogHeader>

          {selectedWinner && (
            <div className="my-4 space-y-3 text-sm">
              <p>
                <strong>Name:</strong> {selectedWinner.name}
              </p>
              <p>
                <strong>GitHub Repo:</strong>{" "}
                <a
                  href={selectedWinner.githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {selectedWinner.githubRepo}
                </a>
              </p>
              <p>
                <strong>Wallet Address:</strong>{" "}
                <span className="font-mono bg-gray-100 px-1 rounded">
                  {selectedWinner.walletAddress}
                </span>
              </p>
              <p>
                <strong>Payout:</strong> {selectedWinner.payoutAmount}{" "}
                {selectedWinner.payoutToken}
              </p>
              <p>
                <strong>Score:</strong> {selectedWinner.score}
              </p>
              <p>
                <strong>Reason:</strong> {selectedWinner.selectionReason}
              </p>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSelectedWinner(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
