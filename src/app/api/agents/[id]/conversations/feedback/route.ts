import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const A0X_AGENT_API_URL = process.env.A0X_AGENT_API_URL;
const API_KEY = process.env.API_KEY;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await request.json();
    const { conversationId, rating, feedback, interactionId, like, messages, directFeedback } =
      body;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const url = `${A0X_AGENT_API_URL}/a0x-framework/${id}/conversations/feedback`;

    const feedbackData: {
      rating?: number;
      feedback?: string;
      interactionId?: string;
      like?: boolean;
      directFeedback?: string;
      conversationId: string;
      messages: any;
    } = {
      conversationId: conversationId,
      messages: messages,
    };

    if (rating !== undefined) {
      feedbackData.rating = rating;
    }

    if (feedback) {
      feedbackData.feedback = feedback;
    }

    if (interactionId) {
      feedbackData.interactionId = interactionId;
    }

    if (like !== undefined) {
      feedbackData.like = like;
    }

    if (directFeedback) {
      feedbackData.directFeedback = directFeedback;
    }

    const response = await axios.post(url, feedbackData, {
      headers: {
        "x-api-key": API_KEY!,
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      return NextResponse.json(
        { error: response.data.message || "Failed to submit feedback" },
        { status: response.status }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
