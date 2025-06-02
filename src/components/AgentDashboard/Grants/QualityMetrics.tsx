"use client";

import type { Grant, QualityAssessment } from "@/types/agent.model";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion";
import { Badge } from "@/components/shadcn/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";
import {
  Info,
  CheckCircle,
  Code,
  FileText,
  Shield,
  Activity,
  Layers,
  FileCode,
  Blocks,
} from "lucide-react";
import Link from "next/link";

interface QualityMetricsProps {
  quality: QualityAssessment;
  grant: Grant;
}

export function QualityMetrics({ quality, grant }: QualityMetricsProps) {
  // Helper function to format score as percentage
  const formatScore = (score: number | null) => {
    if (score === null) return "N/A";
    return `${Math.round(score * 100)}%`;
  };

  // Helper function to get color class based on score
  const getScoreColorClass = (score: number | null) => {
    if (score === null) return "bg-gray-200";
    if (score >= 0.7) return "bg-green-500";
    if (score >= 0.4) return "bg-yellow-400";
    return "bg-red-500";
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="files">Analyzed Files</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Code Review Ratio */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium">Code Review Ratio</h3>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Ratio of code reviews to total commits
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full mb-2">
              <div
                className={`h-2 rounded-full ${getScoreColorClass(
                  quality.codeReviewRatio
                )}`}
                style={{
                  width:
                    quality.codeReviewRatio !== null
                      ? `${quality.codeReviewRatio * 100}%`
                      : "0%",
                }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {formatScore(quality.codeReviewRatio)}
              </span>
            </div>
          </div>

          {/* Documentation Quality */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                <h3 className="font-medium">Documentation Quality</h3>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Quality of project documentation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full mb-2">
              <div
                className={`h-2 rounded-full ${getScoreColorClass(
                  quality.documentationQuality?.score || null
                )}`}
                style={{
                  width: quality.documentationQuality?.score
                    ? `${quality.documentationQuality.score * 100}%`
                    : "0%",
                }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {formatScore(quality.documentationQuality?.score || null)}
              </span>
              {quality.documentationQuality?.reasoning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-blue-600 hover:underline text-xs">
                        View reasoning
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-md">
                      <p className="text-xs">
                        {quality.documentationQuality.reasoning}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Code Quality */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-medium">Code Quality</h3>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Overall code quality assessment</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full mb-2">
              <div
                className={`h-2 rounded-full ${getScoreColorClass(
                  quality.codeQuality?.score || null
                )}`}
                style={{
                  width: quality.codeQuality?.score
                    ? `${quality.codeQuality.score * 100}%`
                    : "0%",
                }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {formatScore(quality.codeQuality?.score || null)}
              </span>
              {quality.codeQuality?.reasoning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-blue-600 hover:underline text-xs">
                        View reasoning
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-md">
                      <p className="text-xs">{quality.codeQuality.reasoning}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Security Score */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                <h3 className="font-medium">Security Score</h3>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Assessment of code security practices
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full mb-2">
              <div
                className={`h-2 rounded-full ${getScoreColorClass(
                  quality.securityScore?.score || null
                )}`}
                style={{
                  width: quality.securityScore?.score
                    ? `${quality.securityScore.score * 100}%`
                    : "0%",
                }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {formatScore(quality.securityScore?.score || null)}
              </span>
              {quality.securityScore?.reasoning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-blue-600 hover:underline text-xs">
                        View reasoning
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-md">
                      <p className="text-xs">
                        {quality.securityScore.reasoning}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Activity Score */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium">Activity Score</h3>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Project development activity level
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full mb-2">
              <div
                className={`h-2 rounded-full ${getScoreColorClass(
                  quality.activityScore?.score || null
                )}`}
                style={{
                  width: quality.activityScore?.score
                    ? `${quality.activityScore.score * 100}%`
                    : "0%",
                }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {formatScore(quality.activityScore?.score || null)}
              </span>
              {quality.activityScore?.reasoning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-blue-600 hover:underline text-xs">
                        View reasoning
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-md">
                      <p className="text-xs">
                        {quality.activityScore.reasoning}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Architecture Score */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-orange-500" />
                <h3 className="font-medium">Architecture Score</h3>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Quality of project architecture</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full mb-2">
              <div
                className={`h-2 rounded-full ${getScoreColorClass(
                  quality.architectureScore?.score || null
                )}`}
                style={{
                  width: quality.architectureScore?.score
                    ? `${quality.architectureScore.score * 100}%`
                    : "0%",
                }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {formatScore(quality.architectureScore?.score || null)}
              </span>
              {quality.architectureScore?.reasoning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-blue-600 hover:underline text-xs">
                        View reasoning
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-md">
                      <p className="text-xs">
                        {quality.architectureScore.reasoning}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>

        {/* Web3 Score */}
        {quality.web3Score && (
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Blocks className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium">Web3 Score</h3>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Assessment of Web3 integration and best practices
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full mb-2">
              <div
                className={`h-2 rounded-full ${getScoreColorClass(
                  quality.web3Score.score
                )}`}
                style={{ width: `${quality.web3Score.score * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {formatScore(quality.web3Score.score)}
              </span>
              {quality.web3Score.reasoning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-blue-600 hover:underline text-xs">
                        View reasoning
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-md">
                      <p className="text-xs">{quality.web3Score.reasoning}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}

        {/* Detected Libraries */}
        {quality.detectedLibraries && quality.detectedLibraries.length > 0 && (
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-3">Detected Libraries</h3>
            <div className="flex flex-wrap gap-2">
              {quality.detectedLibraries.map((lib, index) => (
                <Badge key={index} variant="outline" className="bg-muted">
                  {lib}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Detected Networks */}
        {quality.detectedNetworks && quality.detectedNetworks.length > 0 && (
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-3">Detected Networks</h3>
            <div className="flex flex-wrap gap-2">
              {quality.detectedNetworks.map((network, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`${
                    network.confidence === "high"
                      ? "bg-green-100 text-green-800"
                      : network.confidence === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {network.name}{" "}
                  {network.confidence && `(${network.confidence})`}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="files">
        {quality.analyzedFiles && quality.analyzedFiles.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Analyzed Files</h3>
            <div className="rounded-lg border">
              <Accordion type="single" collapsible className="w-full">
                {quality.analyzedFiles.map((file, index) => (
                  <AccordionItem key={index} value={`file-${index}`}>
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-3 text-sm">
                        <FileCode className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{file.name}</span>
                        <Badge
                          variant="outline"
                          className={
                            file.analysis.isWeb3Related
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100"
                          }
                        >
                          {file.analysis.isWeb3Related ? "Web3" : "Non-Web3"}
                        </Badge>
                        <div className="flex items-center gap-1 ml-2">
                          <div className="h-2 w-16 bg-gray-200 rounded-full">
                            <div
                              className={`h-2 rounded-full ${getScoreColorClass(
                                file.analysis.quality
                              )}`}
                              style={{
                                width: `${file.analysis.quality * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(file.analysis.quality * 100)}%
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Path:</span>{" "}
                          <Link
                            href={`https://github.com/${grant.metrics.repository.fullName}/blob/${grant.metrics.repository.defaultBranch}/${file.analysis.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:underline"
                          >
                            {file.analysis.path}
                          </Link>
                        </div>
                        <div>
                          <span className="font-medium">Size:</span>{" "}
                          <span className="text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Analysis:</span>
                          <p className="text-muted-foreground mt-1">
                            {file.analysis.reasoning}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No file analysis data available for this grant.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
