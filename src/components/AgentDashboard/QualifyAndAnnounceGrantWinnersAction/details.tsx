// React
import { CSSProperties } from "react";

// React Flow
import { Node, Edge } from "@xyflow/react";

// Icons
import { Trophy, FileText, Video, DollarSign, Share2 } from "lucide-react";

interface CustomNodeData {
  label: string;
  icon: React.ReactNode;
  isExecuting?: boolean;
  isCompleted?: boolean;
}

const initialNodes: Node[] = [
  {
    id: "1",
    type: "default",
    data: {
      label: "Determine the winners of the grant",
      icon: <Trophy className="mr-2 h-5 w-5" />,
    },
    position: { x: 250, y: 0 },
    style: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "10px",
      width: 250,
      transition: "background-color 0.3s ease, border-color 0.3s ease",
    },
  },
  {
    id: "2",
    type: "default",
    data: {
      label: "Write script for the video",
      icon: <FileText className="mr-2 h-5 w-5" />,
    },
    position: { x: 250, y: 100 },
    style: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "10px",
      width: 250,
      transition: "background-color 0.3s ease, border-color 0.3s ease",
    },
  },
  {
    id: "3",
    type: "default",
    data: {
      label: "Build the video",
      icon: <Video className="mr-2 h-5 w-5" />,
    },
    position: { x: 250, y: 200 },
    style: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "10px",
      width: 250,
      transition: "background-color 0.3s ease, border-color 0.3s ease",
    },
  },
  {
    id: "4",
    type: "default",
    data: {
      label: "Pay the winners",
      icon: <DollarSign className="mr-2 h-5 w-5" />,
    },
    position: { x: 250, y: 300 },
    style: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "10px",
      width: 250,
      transition: "background-color 0.3s ease, border-color 0.3s ease",
    },
  },
  {
    id: "5",
    type: "default",
    data: {
      label: "Publish on Farcaster, Twitter and Zora",
      icon: <Share2 className="mr-2 h-5 w-5" />,
    },
    position: { x: 250, y: 400 },
    style: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "10px",
      width: 250,
      transition: "background-color 0.3s ease, border-color 0.3s ease",
    },
  },
];

const executionOrder = ["1", "2", "3", "4", "5"];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: false },
  { id: "e2-3", source: "2", target: "3", animated: false },
  { id: "e3-4", source: "3", target: "4", animated: false },
  { id: "e4-5", source: "4", target: "5", animated: false },
];

const executingStyle: CSSProperties = {
  border: "2px solid #007bff",
  background: "#e7f3ff",
};

const completedStyle: CSSProperties = {
  border: "2px solid #28a745",
  background: "#e9f5ea",
};

export {
  initialNodes,
  initialEdges,
  executingStyle,
  completedStyle,
  executionOrder,
};
export type { CustomNodeData };
