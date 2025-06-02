// React Flow
import { Handle, Position, useNodeId } from "@xyflow/react";

// Next
import Image from "next/image";

// Icons
import {
  Globe,
  Loader2,
  AlertTriangle,
  X,
  FileText,
  RefreshCcw,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface KnowledgeNodeProps {
  data: {
    label: string;
    type: string;
    status?: string;
    knowledgeId: string;
    onDelete: (id: string) => void;
    onRefresh: (id: string, nodeId: string) => void;
    isDynamic: boolean;
  };
}

const formatUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.replace(/\/+$/, "");
    return urlObj.hostname.replace("www.", "") + (path === "/" ? "" : path);
  } catch {
    return url;
  }
};

const formatFarcasterUrl = (url: string): string => {
  try {
    if (url.startsWith("@")) {
      return url;
    }

    const urlObj = new URL(url);

    if (urlObj.hostname.includes("warpcast.com")) {
      const username = urlObj.pathname.split("/").filter(Boolean).pop() || "";
      return `@${username}`;
    }

    return url;
  } catch {
    return url;
  }
};

export function KnowledgeNode({ data }: KnowledgeNodeProps) {
  const { label, status, type, onDelete, onRefresh, isDynamic } = data;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const nodeId = useNodeId();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(label);
  };

  const handleRefreshClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    onRefresh(label, nodeId ?? "");
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getBorderStyle = () => {
    if (type === "farcaster") {
      return "border-[#8A63D2]";
    } else if (isDynamic) {
      return "border-teal-500";
    }
    return "border-stone-400";
  };

  const getHandleClassName = () => {
    if (type === "farcaster") {
      return "w-4 !bg-[#8A63D2]";
    } else if (isDynamic) {
      return "w-4 !bg-teal-500";
    }
    return "w-4 !bg-stone-400";
  };

  return (
    <div
      className={`px-3 py-1.5 shadow-md rounded-md bg-white border ${getBorderStyle()} w-[150px] relative group`}
    >
      {isDynamic && (
        <button
          onClick={handleRefreshClick}
          className="absolute -top-2 right-2 p-0.5 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-600 z-10"
          aria-label="Refresh knowledge"
        >
          <RefreshCcw
            className={cn("w-3 h-3", isRefreshing && "animate-spin")}
          />
        </button>
      )}

      <button
        onClick={handleDeleteClick}
        className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-10"
        aria-label="Delete knowledge"
      >
        <X className="w-3 h-3" />
      </button>

      <Handle
        type="target"
        position={Position.Top}
        className={getHandleClassName()}
      />
      <div className="flex flex-col items-center gap-1">
        {type === "pdf" ? (
          <FileText className="w-5 h-5 text-blue-500" />
        ) : type === "farcaster" ? (
          <Image
            src="/assets/farcaster.svg"
            alt="Farcaster"
            width={20}
            height={20}
          />
        ) : (
          <Globe className="w-5 h-5 text-blue-500" />
        )}

        <div className="text-[10px] font-medium text-center break-all line-clamp-2">
          {type === "farcaster" ? formatFarcasterUrl(label) : formatUrl(label)}
        </div>

        {status === "processing" && (
          <div className="flex items-center justify-center w-full mt-1 bg-blue-50 rounded-sm py-0.5">
            <Loader2 className="animate-spin h-3.5 w-3.5 text-blue-500" />
            <span className="text-[9px] text-blue-600 ml-1 font-medium">
              Processing ...
            </span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center justify-center w-full mt-1 bg-red-50 rounded-sm py-0.5">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            <span className="text-[9px] text-red-600 ml-1 font-medium">
              Error
            </span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={getHandleClassName()}
      />
    </div>
  );
}
