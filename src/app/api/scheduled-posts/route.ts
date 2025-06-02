import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;

/**
 * GET handler to fetch scheduled posts for a specific agent
 * @route GET /api/scheduled-posts?agentId={agentId}&platform={platform}
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get("agentId");
    const platform = searchParams.get("platform");

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }
    const endpoint =
      platform === "twitter"
        ? `${A0X_AGENT_API_URL}/a0x-framework/scheduled-posts/${agentId}`
        : `${A0X_AGENT_API_URL}/a0x-framework/scheduled-casts/${agentId}`;
    const response = await axios.get(endpoint);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching scheduled posts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch scheduled posts" },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * POST handler to create a new scheduled cast
 * @route POST /api/scheduled-posts
 * @body {agentId, instruction, scheduleTime, recurringPattern?}
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agentId,
      instruction,
      scheduleTime,
      recurringPattern,
      platform,
      taskType,
      mentionTopics,
      targetProfiles,
    } = body;

    // Validate required fields
    switch (taskType) {
      case "schedule":
        if (
          !agentId ||
          !instruction ||
          !platform ||
          !scheduleTime ||
          !recurringPattern
        ) {
          return NextResponse.json(
            { error: "All fields are required" },
            { status: 400 }
          );
        }
        break;
      case "mention":
        if (!agentId || !instruction || !platform || !mentionTopics) {
          return NextResponse.json(
            { error: "All fields are required" },
            { status: 400 }
          );
        }
        break;
      case "target":
        if (!agentId || !instruction || !platform || !targetProfiles) {
          return NextResponse.json(
            { error: "All fields are required" },
            { status: 400 }
          );
        }
        break;
    }

    // Prepare payload
    const payload: {
      agentId: string;
      instruction: string;
      scheduleTime: string;
      platform: string;
      taskType: string;
      recurringPattern: string;
      mentionTopics: string;
      targetProfiles: string;
    } = {
      agentId,
      instruction,
      scheduleTime,
      platform,
      taskType,
      recurringPattern,
      mentionTopics,
      targetProfiles,
    };

    const response = await axios.post(
      `${A0X_AGENT_API_URL}/a0x-framework/scheduled-posts`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error scheduling cast:", error);
    return NextResponse.json(
      { error: error.message || "Failed to schedule cast" },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * PUT handler to update a scheduled cast
 * @route PUT /api/scheduled-posts
 * @body {agentId, instruction, scheduleTime, recurringPattern?}
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agentId,
      instruction,
      scheduleTime,
      recurringPattern,
      platform,
      taskType,
      mentionTopics,
      targetProfiles,
      id,
    } = body;

    // Validate required fields
    switch (taskType) {
      case "schedule":
        if (
          !agentId ||
          !instruction ||
          !platform ||
          !scheduleTime ||
          !recurringPattern
        ) {
          return NextResponse.json(
            { error: "All fields are required" },
            { status: 400 }
          );
        }
        break;
      case "mention":
        if (!agentId || !instruction || !platform || !mentionTopics) {
          return NextResponse.json(
            { error: "All fields are required" },
            { status: 400 }
          );
        }
        break;
      case "target":
        if (!agentId || !instruction || !platform || !targetProfiles) {
          return NextResponse.json(
            { error: "All fields are required" },
            { status: 400 }
          );
        }
        break;
    }

    // Prepare payload
    const payload: {
      id: string;
      agentId: string;
      instruction: string;
      scheduleTime: string;
      platform: string;
      taskType: string;
      recurringPattern: string;
      mentionTopics: string;
      targetProfiles: string;
    } = {
      id,
      agentId,
      instruction,
      scheduleTime,
      platform,
      taskType,
      recurringPattern,
      mentionTopics,
      targetProfiles,
    };

    const response = await axios.put(
      `${A0X_AGENT_API_URL}/a0x-framework/scheduled-posts`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error scheduling cast:", error);
    return NextResponse.json(
      { error: error.message || "Failed to schedule cast" },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * DELETE handler to remove a scheduled cast
 * @route DELETE /api/scheduled-posts?postId={postId}&platform={platform}
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const postId = url.searchParams.get("postId");
    const platform = url.searchParams.get("platform");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    await axios.delete(
      `${A0X_AGENT_API_URL}/a0x-framework/scheduled-posts?postId=${postId}&platform=${platform}`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting scheduled post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete scheduled post" },
      { status: error.response?.status || 500 }
    );
  }
}
