"use client";

import type { RepositoryMetrics } from "@/types/agent.model";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import { GitFork, Star, GitCommit, Users } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/avatar";
import { Progress } from "@/components/shadcn/progress";

interface RepoMetricsProps {
  metrics: RepositoryMetrics;
}

export function RepoMetrics({ metrics }: RepoMetricsProps) {
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stars
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-2" />
              <span className="text-2xl font-bold">{metrics.stars}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Forks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <GitFork className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">{metrics.forks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <GitCommit className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-2xl font-bold">
                {metrics.activity.commits}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-purple-500 mr-2" />
              <span className="text-2xl font-bold">
                {metrics.contributors.totalContributors}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Languages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.languages.map((lang, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-muted-foreground">
                    {lang.percentage}%
                  </span>
                </div>
                <Progress value={lang.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.contributors.topContributors.map((contributor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={contributor.avatarUrl || "/placeholder.svg"}
                      alt={contributor.username}
                    />
                    <AvatarFallback>
                      {contributor.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{contributor.username}</div>
                    <div className="text-xs text-muted-foreground">
                      {contributor.contributions} commits
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-muted">
                  {contributor.percent}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Last Active
                </div>
                <div>{formatDate(metrics.activity.lastActiveAt)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Pull Requests
                </div>
                <div>
                  {metrics.activity.pullRequestsMerged} merged /{" "}
                  {metrics.activity.pullRequestsOpened} opened
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Issues
                </div>
                <div>
                  {metrics.activity.issuesResolved} resolved /{" "}
                  {metrics.activity.issuesOpened} opened
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
