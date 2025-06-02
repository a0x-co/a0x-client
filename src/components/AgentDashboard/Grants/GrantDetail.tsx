"use client";

import type { Grant, GrantUrlAnalysis } from "@/types/agent.model";
import { Button } from "@/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";
import {
  ExternalLink,
  Github,
  Globe,
  Star,
  User,
  CheckCircle,
  XCircle,
  Twitter,
  MessageSquare,
  Play,
} from "lucide-react";
import { QualityMetrics } from "@/components/AgentDashboard/Grants/QualityMetrics";
import { RepoMetrics } from "@/components/AgentDashboard/Grants/RepoMetrics";
import { Separator } from "@radix-ui/react-select";
import { useMemo } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/shadcn/avatar";
import { Progress } from "@/components/shadcn/progress";
import Link from "next/link";
import FarcasterIcon from "@/components/Icons/FarcasterIcon";
import { FaXTwitter } from "react-icons/fa6";
import { parseMessage } from "@/lib/utils";
import Image from "next/image";

interface GrantDetailProps {
  grant: Grant | GrantUrlAnalysis;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  tabDetailSelected:
    | "details"
    | "quality"
    | "repository"
    | "social"
    | "video"
    | "urlanalysis";
  setTabDetailSelected: (
    tab:
      | "details"
      | "quality"
      | "repository"
      | "social"
      | "video"
      | "urlanalysis"
  ) => void;
}

// Función auxiliar para verificar el tipo de grant
const isGrantUrlAnalysis = (
  grant: Grant | GrantUrlAnalysis
): grant is GrantUrlAnalysis => {
  return "urlAnalysis" in grant && !("metrics" in grant);
};

export function GrantDetail({
  grant,
  onApprove,
  onDeny,
  tabDetailSelected,
  setTabDetailSelected,
}: GrantDetailProps) {
  const scorePonderation = useMemo(() => {
    if (isGrantUrlAnalysis(grant)) {
      // Para GrantUrlAnalysis, usa el relevanceScore si está disponible
      return grant.urlAnalysis?.analysis?.relevanceScore || 0;
    }

    if (!grant.metrics?.repository?.quality) return 0;

    const metrics = [
      grant.metrics.repository.quality.web3Score?.score,
      grant.metrics.repository.quality.activityScore?.score,
      grant.metrics.repository.quality.documentationQuality?.score,
      grant.metrics.repository.quality.codeQuality?.score,
      grant.metrics.repository.quality.securityScore?.score,
      grant.metrics.repository.quality.architectureScore?.score,
    ];

    const validMetrics = metrics.filter(
      (metric) => metric !== null && metric !== undefined
    );

    if (validMetrics.length === 0) return 0;

    const sum = validMetrics.reduce((acc, score) => acc + score, 0);

    return sum / validMetrics.length;
  }, [grant]);

  const { originalMessage, conversationTopics, participantSummaries } =
    !isGrantUrlAnalysis(grant) &&
    grant.request?.userMessage &&
    grant.request?.metadataFromClient?.twitter
      ? parseMessage(grant.request.userMessage)
      : {
          originalMessage: !isGrantUrlAnalysis(grant)
            ? grant.request?.userMessage || ""
            : "",
          conversationTopics: [],
          participantSummaries: {},
        };

  // Función para extraer el ID de un video de YouTube desde una URL
  const getYoutubeVideoId = (url: string): string => {
    // Patrón para URLs de YouTube estándar (como https://www.youtube.com/watch?v=VIDEO_ID)
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : "";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">
              {isGrantUrlAnalysis(grant)
                ? grant.url.replace("https://", "").replace("http://", "") ||
                  "URL Project"
                : grant.projectName}
            </CardTitle>
            <CardDescription>
              Grant Application #{grant.id ? grant.id.slice(0, 8) : "N/A"} •{" "}
              {new Date(grant.timestamp).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge
            variant={
              grant.status === "approved"
                ? "success"
                : grant.status === "denied"
                ? "destructive"
                : "outline"
            }
            className="text-sm"
          >
            {grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          value={tabDetailSelected}
          onValueChange={(value) =>
            setTabDetailSelected(
              value as
                | "details"
                | "quality"
                | "repository"
                | "social"
                | "video"
                | "urlanalysis"
            )
          }
        >
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            {isGrantUrlAnalysis(grant) ? (
              <>
                <TabsTrigger value="urlanalysis">URL Analysis</TabsTrigger>
                {grant.videoAnalysis && (
                  <TabsTrigger value="video">Video Analysis</TabsTrigger>
                )}
              </>
            ) : (
              <>
                <TabsTrigger value="quality">Quality Assessment</TabsTrigger>
                <TabsTrigger value="repository">Repository</TabsTrigger>
              </>
            )}
            <TabsTrigger value="social">Social Interactions</TabsTrigger>
          </TabsList>

          <TabsContent
            value="details"
            className="space-y-6"
            id={`details-tab-${grant.id || "url"}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 col-span-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </h3>
                  <p className="text-sm">
                    {isGrantUrlAnalysis(grant)
                      ? grant.urlAnalysis?.analysis?.summary || grant.url
                      : grant.metrics?.repository?.description ||
                        grant.metrics?.repository?.descriptionFromAnalysis}
                  </p>
                </div>

                <div className="flex justify-between">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      {grant.status === "paid"
                        ? "Paid Amount"
                        : "Requested Amount"}
                    </h3>
                    <p className="text-2xl font-bold">
                      {grant.grantAmountInUSDC !== undefined &&
                      grant.grantAmountInUSDC !== null
                        ? grant.grantAmountInUSDC.toLocaleString()
                        : "0"}{" "}
                      USDC
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 text-right">
                      {grant.walletAddresses
                        ? grant.walletAddresses.length > 1
                          ? "Wallet Addresses"
                          : "Wallet Address"
                        : grant.walletAddress
                        ? "Wallet Address"
                        : "Wallet Address"}
                    </h3>
                    <p className="text-2xl font-bold">
                      {grant.walletAddresses ? (
                        grant.walletAddresses.length > 1 ? (
                          grant.walletAddresses.map((wallet) => (
                            <Link
                              key={wallet}
                              href={`https://basescan.org/address/${wallet}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {wallet.slice(0, 6)}...{wallet.slice(-4)}
                            </Link>
                          ))
                        ) : (
                          "No wallet address"
                        )
                      ) : grant.walletAddress ? (
                        <Link
                          href={`https://basescan.org/address/${grant.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {grant.walletAddress.slice(0, 6)}...
                          {grant.walletAddress.slice(-4)}
                        </Link>
                      ) : (
                        "No wallet address"
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Rating
                  </h3>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      return (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < scorePonderation * 5
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      );
                    })}
                    <span className="ml-2 text-sm font-medium">
                      {(scorePonderation * 5).toFixed(2)}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {isGrantUrlAnalysis(grant) ? (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        URL
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <Link
                            href={grant.url || ""}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center"
                          >
                            {grant.url?.replace(/^https?:\/\//, "") || ""}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    {grant.urlAnalysis?.analysis?.keyTakeaways && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Key Takeaways
                        </h3>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {grant.urlAnalysis.analysis.keyTakeaways.map(
                            (takeaway, index) => (
                              <li key={index}>{takeaway}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Repositories
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <svg
                            role="img"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                          >
                            <title>GitHub</title>
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                          </svg>
                          <a
                            href={`https://github.com/${grant.metrics?.repository?.fullName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center"
                          >
                            {grant.metrics?.repository?.fullName?.replace(
                              "https://github.com/",
                              ""
                            )}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {grant.website && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Websites
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <Link
                              href={grant.website || ""}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center"
                            >
                              {grant.website?.replace(/^https?:\/\//, "")}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Created At
                      </h3>
                      <p className="text-sm">
                        {grant.metrics?.repository?.createdAt
                          ? new Date(
                              grant.metrics.repository.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {!isGrantUrlAnalysis(grant) &&
              grant.metrics?.repository?.contributors && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Contributors
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {grant.metrics.repository.contributors.topContributors.map(
                      (contributor, index) => (
                        <div
                          key={index}
                          className="rounded-lg border p-3 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={contributor.avatarUrl}
                                  alt={contributor.username}
                                />
                                <AvatarFallback>
                                  {contributor.username
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium block">
                                  {contributor.username}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Contributions: {contributor.contributions}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>Contribution</span>
                              <span className="font-medium">
                                {contributor.percent}%
                              </span>
                            </div>
                            <Progress
                              value={contributor.percent}
                              className="h-1.5"
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {isGrantUrlAnalysis(grant) && grant.urlAnalysis?.screenshotUrl && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Screenshot
                </h3>
                <div className="max-h-[400px] overflow-y-auto">
                  <Image
                    src={grant.urlAnalysis.screenshotUrl}
                    alt="Screenshot of the site"
                    className="w-[500px] h-auto rounded-lg"
                    width={500}
                    height={300}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="urlanalysis">
            {isGrantUrlAnalysis(grant) && (
              <div className="space-y-6">
                <div className="rounded-lg border p-6">
                  <h3 className="text-lg font-medium mb-4">URL Analysis</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          URL
                        </h4>
                        <p className="mt-1 break-all">
                          <Link
                            href={grant.url || ""}
                            target="_blank"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {grant.url}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Summary
                      </h4>
                      <p className="mt-1">
                        {grant.urlAnalysis?.analysis?.summary || "No available"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Relevance Score
                      </h4>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                              width: `${
                                (grant.urlAnalysis?.analysis?.relevanceScore ||
                                  0) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span>
                          {(grant.urlAnalysis?.analysis?.relevanceScore || 0) *
                            100}{" "}
                          %
                        </span>
                      </div>
                    </div>

                    {grant.urlAnalysis?.analysis?.targetAudience && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Target Audience
                        </h4>
                        <p className="mt-1">
                          {grant.urlAnalysis.analysis.targetAudience}
                        </p>
                      </div>
                    )}

                    {grant.urlAnalysis?.analysis?.valueProposition && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Value Proposition
                        </h4>
                        <p className="mt-1">
                          {grant.urlAnalysis.analysis.valueProposition}
                        </p>
                      </div>
                    )}

                    {grant.urlAnalysis?.analysis?.ctaEffectiveness && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          CTA Effectiveness
                        </h4>
                        <p className="mt-1">
                          {grant.urlAnalysis.analysis.ctaEffectiveness}
                        </p>
                      </div>
                    )}

                    {grant.urlAnalysis?.analysis?.feedback && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Feedback
                        </h4>
                        <p className="mt-1">
                          {grant.urlAnalysis.analysis.feedback}
                        </p>
                      </div>
                    )}

                    {grant.urlAnalysis?.analysis?.persuasionElements &&
                      grant.urlAnalysis.analysis.persuasionElements.length >
                        0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Persuasive Elements
                          </h4>
                          <ul className="list-disc pl-5 mt-1">
                            {grant.urlAnalysis.analysis.persuasionElements.map(
                              (element, index) => (
                                <li key={index}>{element}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {grant.urlAnalysis?.analysis?.keyTakeaways &&
                      grant.urlAnalysis.analysis.keyTakeaways.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Key Takeaways
                          </h4>
                          <ul className="list-disc pl-5 mt-1">
                            {grant.urlAnalysis.analysis.keyTakeaways.map(
                              (takeaway, index) => (
                                <li key={index}>{takeaway}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {grant.urlAnalysis?.crucialQuestions &&
                      grant.urlAnalysis.crucialQuestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Crucial Questions
                          </h4>
                          <ul className="list-disc pl-5 mt-1">
                            {grant.urlAnalysis.crucialQuestions.map(
                              (question, index) => (
                                <li key={index}>{question}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {grant.urlAnalysis?.visitedPages &&
                      grant.urlAnalysis.visitedPages.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Visited Pages
                          </h4>
                          <ul className="list-disc pl-5 mt-1">
                            {grant.urlAnalysis.visitedPages.map(
                              (page, index) => (
                                <li key={index}>{page}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>

                {grant.urlAnalysis?.screenshotUrl && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Screenshot
                    </h4>
                    <div className="max-h-[400px] overflow-y-auto">
                      <Image
                        src={grant.urlAnalysis.screenshotUrl}
                        alt="Captura de pantalla del sitio"
                        className="w-96 h-auto"
                        width={500}
                        height={300}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </h4>
                  <p className="mt-1">
                    {grant.lastUpdated
                      ? new Date(grant.lastUpdated).toLocaleString()
                      : "No disponible"}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="video">
            {isGrantUrlAnalysis(grant) && grant.videoAnalysis && (
              <div className="space-y-6">
                <div className="rounded-lg border p-6">
                  <h3 className="text-lg font-medium mb-4">Video Analysis</h3>

                  <div className="space-y-4">
                    {/* Video Player Section */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Video Preview
                      </h4>
                      {grant.videoAnalysis.source && (
                        <div className="border rounded-lg overflow-hidden">
                          {grant.videoAnalysis.source.includes("youtube.com") ||
                          grant.videoAnalysis.source.includes("youtu.be") ? (
                            // YouTube Embed
                            <iframe
                              src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                                grant.videoAnalysis.source
                              )}`}
                              className="w-full aspect-video"
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : grant.videoAnalysis.source.endsWith(".mp4") ||
                            grant.videoAnalysis.source.endsWith(".webm") ||
                            grant.videoAnalysis.source.endsWith(".mov") ? (
                            // Video Player para MP4 y otros formatos de video
                            <video
                              controls
                              className="w-full aspect-video"
                              poster={grant.urlAnalysis?.screenshotUrl}
                            >
                              <source
                                src={grant.videoAnalysis.source}
                                type={`video/${grant.videoAnalysis.source
                                  .split(".")
                                  .pop()}`}
                              />
                              Your browser does not support video playback.
                            </video>
                          ) : (
                            // Fallback para cuando no es un formato de video reconocido
                            <div className="flex items-center justify-center bg-gray-100 aspect-video">
                              <div className="text-center p-4">
                                <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">
                                  Preview not available for this type of video
                                  source
                                </p>
                                <a
                                  href={grant.videoAnalysis.source}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline mt-2 inline-block"
                                >
                                  View video on original site
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {grant.videoAnalysis.error && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Error
                        </h4>
                        <p className="mt-1 text-red-500">
                          {grant.videoAnalysis.error}
                        </p>
                      </div>
                    )}

                    {grant.videoAnalysis.analysis && (
                      <>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Summary
                          </h4>
                          <p className="mt-1">
                            {grant.videoAnalysis.analysis.summary ||
                              "No available"}
                          </p>
                        </div>

                        {grant.videoAnalysis.analysis.keyFeaturesShown &&
                          grant.videoAnalysis.analysis.keyFeaturesShown.length >
                            0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">
                                Key Features Shown
                              </h4>
                              <ul className="list-disc pl-5 mt-1">
                                {grant.videoAnalysis.analysis.keyFeaturesShown.map(
                                  (feature, index) => (
                                    <li key={index}>{feature}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                        {grant.videoAnalysis.analysis.questionsRaised &&
                          grant.videoAnalysis.analysis.questionsRaised.length >
                            0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">
                                Questions Raised
                              </h4>
                              <ul className="list-disc pl-5 mt-1">
                                {grant.videoAnalysis.analysis.questionsRaised.map(
                                  (question, index) => (
                                    <li key={index}>{question}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            AI Integration
                          </h4>
                          <p className="mt-1">
                            {grant.videoAnalysis.analysis.aiIntegration ||
                              "No mentioned"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Completeness Level
                          </h4>
                          <p className="mt-1">
                            {grant.videoAnalysis.analysis.completenessLevel ||
                              "No specified"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Overall Impression
                          </h4>
                          <p className="mt-1">
                            {grant.videoAnalysis.analysis.overallImpression ||
                              "No available"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Relevance for Grants
                          </h4>
                          <p className="mt-1">
                            {grant.videoAnalysis.analysis.grantsRelevance ||
                              "No specified"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            UX Feedback
                          </h4>
                          <p className="mt-1">
                            {grant.videoAnalysis.analysis.uxFeedback ||
                              "No available"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quality">
            {isGrantUrlAnalysis(grant) ? (
              <div className="space-y-6">
                <div className="rounded-lg border p-6">
                  <h3 className="text-lg font-medium mb-4">Análisis de URL</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Summary
                      </h4>
                      <p className="mt-1">
                        {grant.urlAnalysis?.analysis?.summary || "No available"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Relevance Score
                      </h4>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                              width: `${
                                grant.urlAnalysis?.analysis?.relevanceScore || 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span>
                          {(
                            (grant.urlAnalysis?.analysis?.relevanceScore || 0) /
                            100
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {grant.urlAnalysis?.analysis?.targetAudience && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Target Audience
                        </h4>
                        <p className="mt-1">
                          {grant.urlAnalysis.analysis.targetAudience}
                        </p>
                      </div>
                    )}

                    {grant.urlAnalysis?.analysis?.valueProposition && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Value Proposition
                        </h4>
                        <p className="mt-1">
                          {grant.urlAnalysis.analysis.valueProposition}
                        </p>
                      </div>
                    )}

                    {grant.urlAnalysis?.analysis?.persuasionElements &&
                      grant.urlAnalysis.analysis.persuasionElements.length >
                        0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Persuasive Elements
                          </h4>
                          <ul className="list-disc pl-5 mt-1">
                            {grant.urlAnalysis.analysis.persuasionElements.map(
                              (element, index) => (
                                <li key={index}>{element}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ) : grant.metrics?.repository?.quality ? (
              <QualityMetrics
                quality={grant.metrics.repository.quality}
                grant={grant}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No quality assessment data available for this grant.
              </div>
            )}
          </TabsContent>

          <TabsContent value="repository">
            {isGrantUrlAnalysis(grant) ? (
              <div className="text-center py-8 text-muted-foreground">
                La información del repositorio no está disponible para proyectos
                URL.
              </div>
            ) : grant.metrics ? (
              <RepoMetrics metrics={grant.metrics.repository} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No repository metrics available for this grant.
              </div>
            )}
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            {!isGrantUrlAnalysis(grant) &&
              grant.request?.metadataFromClient && (
                <>
                  <div className="space-y-4">
                    {!isGrantUrlAnalysis(grant) &&
                      grant.request?.metadataFromClient?.twitter && (
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <FaXTwitter className="h-5 w-5 text-blue-400" />
                            <h3 className="font-medium">Twitter</h3>
                          </div>
                          <div className="space-y-3">
                            {!isGrantUrlAnalysis(grant) &&
                            grant.request?.metadataFromClient?.twitter
                              .authorUsername ? (
                              <>
                                <div>
                                  <span className="text-sm font-medium">
                                    User
                                  </span>
                                  <Link
                                    href={`https://twitter.com/${
                                      !isGrantUrlAnalysis(grant) &&
                                      grant.request?.metadataFromClient?.twitter
                                        .authorUsername
                                    }`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-sm text-blue-600 hover:underline"
                                  >
                                    @
                                    {!isGrantUrlAnalysis(grant) &&
                                      grant.request?.metadataFromClient?.twitter
                                        .authorUsername}
                                  </Link>
                                </div>

                                {!isGrantUrlAnalysis(grant) &&
                                  grant.request?.metadataFromClient?.twitter
                                    .tweetId && (
                                    <div className="mt-4">
                                      <span className="text-sm font-medium">
                                        Tweet
                                      </span>

                                      <div className="flex items-start gap-2 mt-2">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                          <User className="h-4 w-4 text-gray-600" />
                                        </div>

                                        <div className="bg-gray-100 rounded-lg p-3 w-full">
                                          {originalMessage ? (
                                            <p className="text-sm">
                                              {originalMessage}
                                            </p>
                                          ) : (
                                            <p className="text-sm italic text-gray-500">
                                              Tweet content not available
                                            </p>
                                          )}

                                          <div className="flex items-center justify-between gap-2 mt-2">
                                            <div className="flex items-center gap-1">
                                              <Link
                                                href={`https://twitter.com/${
                                                  !isGrantUrlAnalysis(grant) &&
                                                  grant.request
                                                    ?.metadataFromClient
                                                    ?.twitter.authorUsername
                                                }/status/${
                                                  !isGrantUrlAnalysis(grant) &&
                                                  grant.request
                                                    ?.metadataFromClient
                                                    ?.twitter.tweetId
                                                }`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 underline"
                                              >
                                                View tweet
                                                <ExternalLink className="w-3 h-3" />
                                              </Link>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                              {grant.timestamp
                                                ? new Date(
                                                    grant.timestamp
                                                  ).toLocaleString()
                                                : ""}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </>
                            ) : (
                              <>
                                <div>
                                  <span className="text-sm font-medium">
                                    Handle:
                                  </span>
                                  <a
                                    href={`https://twitter.com/${
                                      !isGrantUrlAnalysis(grant) &&
                                      grant.request?.metadataFromClient?.twitter
                                        .handle
                                    }`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-sm text-blue-600 hover:underline"
                                  >
                                    @
                                    {!isGrantUrlAnalysis(grant) &&
                                      grant.request?.metadataFromClient?.twitter
                                        .handle}
                                  </a>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                    {!isGrantUrlAnalysis(grant) &&
                      grant.request?.metadataFromClient?.farcaster && (
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <FarcasterIcon className="h-5 w-5" />
                            <h3 className="font-medium">Farcaster</h3>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium">User</span>
                              <Link
                                href={`https://warpcast.com/${
                                  !isGrantUrlAnalysis(grant) &&
                                  grant.request?.metadataFromClient?.farcaster
                                    .author.username
                                }`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-sm text-blue-600 hover:underline"
                              >
                                @
                                {!isGrantUrlAnalysis(grant) &&
                                  grant.request?.metadataFromClient?.farcaster
                                    .author.username}
                              </Link>
                            </div>

                            {!isGrantUrlAnalysis(grant) &&
                              grant.request?.userMessage && (
                                <div className="mt-4">
                                  <span className="text-sm font-medium">
                                    Cast:
                                  </span>

                                  <div className="flex items-start gap-2 mt-2">
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                      <User className="h-4 w-4 text-gray-600" />
                                    </div>

                                    <div className="bg-gray-100 rounded-lg p-3 w-full">
                                      <p className="text-sm">
                                        {originalMessage}
                                      </p>

                                      <div className="flex items-center justify-between gap-2 mt-2">
                                        {!isGrantUrlAnalysis(grant) &&
                                          grant.request?.metadataFromClient
                                            ?.farcaster.cast?.hash && (
                                            <div className="flex items-center gap-1">
                                              <Link
                                                href={`https://warpcast.com/~/cast/${
                                                  !isGrantUrlAnalysis(grant) &&
                                                  grant.request
                                                    ?.metadataFromClient
                                                    ?.farcaster.cast?.hash
                                                }`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 underline"
                                              >
                                                View cast
                                                <ExternalLink className="w-3 h-3" />
                                              </Link>
                                            </div>
                                          )}
                                        <span className="text-xs text-gray-500">
                                          {grant.timestamp
                                            ? new Date(
                                                grant.timestamp
                                              ).toLocaleString()
                                            : ""}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                    {!isGrantUrlAnalysis(grant) &&
                      grant.request?.metadataFromClient?.telegram && (
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-blue-500"
                            >
                              <path d="m22 3-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 3" />
                              <path d="M2 3v18h20V3" />
                              <path d="m22 3-10 8L2 3" />
                            </svg>
                            <h3 className="font-medium">Telegram</h3>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium">
                                Username:
                              </span>
                              <span className="ml-2 text-sm">
                                @
                                {!isGrantUrlAnalysis(grant) &&
                                  grant.request?.metadataFromClient?.telegram
                                    .username}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">
                                Group Members:
                              </span>
                              <span className="ml-2 text-sm">
                                {!isGrantUrlAnalysis(grant) &&
                                grant.request?.metadataFromClient?.telegram
                                  .groupMembers !== undefined
                                  ? grant.request.metadataFromClient.telegram.groupMembers.toLocaleString()
                                  : "0"}
                              </span>
                            </div>

                            {!isGrantUrlAnalysis(grant) &&
                              grant.request?.metadataFromClient?.telegram
                                .recentMessages &&
                              grant.request?.metadataFromClient?.telegram
                                .recentMessages.length > 0 && (
                                <div className="mt-4">
                                  <span className="text-sm font-medium">
                                    Recent Messages:
                                  </span>
                                  <div className="mt-2 space-y-4">
                                    {!isGrantUrlAnalysis(grant) &&
                                      grant.request?.metadataFromClient?.telegram.recentMessages.map(
                                        (message: string, i: number) => (
                                          <div
                                            key={i}
                                            className="flex items-start gap-2"
                                          >
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                              <User className="h-4 w-4 text-gray-600" />
                                            </div>

                                            <div className="bg-gray-100 rounded-lg p-3 w-full">
                                              <p className="text-sm">
                                                {message}
                                              </p>

                                              <div className="flex items-center justify-end gap-2 mt-2">
                                                <span className="text-xs text-gray-500">
                                                  {new Date(
                                                    Number(grant.timestamp) -
                                                      i * 86400000
                                                  ).toLocaleString()}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                  </div>
                </>
              )}

            {(isGrantUrlAnalysis(grant) ||
              !grant.request?.metadataFromClient) && (
              <div className="text-center py-8 text-muted-foreground">
                No social media interactions available for this grant.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => onDeny(grant.id || "")}
          // disabled={grant.status === "denied"}
          className="flex items-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          Deny Grant
        </Button>
        <Button
          onClick={() => onApprove(grant.id || "")}
          // disabled={grant.status === "approved"}
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Approve Grant
        </Button>
      </CardFooter>
    </Card>
  );
}
