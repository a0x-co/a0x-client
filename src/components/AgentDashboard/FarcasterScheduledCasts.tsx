// React
import { useState } from "react";

// Http client
import axios from "axios";

// Icons
import { Calendar, Clock, RefreshCw, Trash2, AlertCircle } from "lucide-react";

// Components
import { Button } from "@/components/shadcn/button";
import SocialMediaScheduleModal from "./SocialMediaScheduleModal";

// Types
import { Agent } from "@/types/agent.model";

interface ScheduledCast {
  id?: string;
  agentId: string;
  instruction: string;
  scheduleTime: {
    _seconds: number;
    _nanoseconds: number;
  };
  recurringPattern?: string;
  isActive: boolean;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  lastPublishedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
  isProcessing?: boolean;
  lastProcessingStarted?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface FarcasterScheduledCastsProps {
  agent: Agent;
  refetchAgent: () => void;
}

export function FarcasterScheduledCasts({
  agent,
  refetchAgent,
}: FarcasterScheduledCastsProps) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Función para convertir segundos a Date
  const convertFirestoreTimestamp = (timestamp: {
    _seconds: number;
    _nanoseconds: number;
  }) => {
    return new Date(timestamp._seconds * 1000);
  };

  // Function to format the date
  const formatDate = (timestamp: {
    _seconds: number;
    _nanoseconds: number;
  }) => {
    const date = convertFirestoreTimestamp(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Function to get the recurring pattern text
  const getRecurringPatternText = (pattern?: string) => {
    if (!pattern) return "Once";

    const patterns: Record<string, string> = {
      hourly: "Hourly",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly",
    };

    return patterns[pattern] || "Once";
  };

  const handleDeleteCast = async (castId: string) => {
    try {
      setIsDeleting(castId);
      await axios.delete(`/api/scheduled-posts/${castId}`);
      // Aquí deberías implementar la lógica para actualizar el estado global
      // ya que los datos ahora vienen desde el prop agent
    } catch (error) {
      console.error("Error deleting scheduled cast:", error);
      setError("Could not delete the scheduled cast. Please try again later.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-800">
            Scheduled Casts
          </h3>
        </div>

        <Button
          onClick={() => setIsScheduleModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 h-auto"
        >
          Schedule New
        </Button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-base text-red-700">{error}</p>
        </div>
      ) : agent?.scheduledCasts?.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-center">
          <p className="text-base text-blue-700">
            You don&apos;t have any scheduled casts. Schedule your first cast!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {agent?.scheduledCasts?.map((cast) => (
            <div
              key={cast.agentId}
              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-800 mb-3 line-clamp-2">
                    {cast.instruction}
                  </p>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span>Next: {formatDate(cast.scheduleTime)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-purple-500" />
                      <span>
                        {getRecurringPatternText(cast.recurringPattern)}
                      </span>
                    </div>

                    {cast.lastPublishedAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span>
                          Last published: {formatDate(cast.lastPublishedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 p-2 h-auto"
                  onClick={() => handleDeleteCast(cast.agentId)}
                  disabled={isDeleting === cast.agentId}
                >
                  {isDeleting === cast.agentId ? (
                    <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </Button> */}
              </div>
            </div>
          ))}
        </div>
      )}

      {agent.agentId && (
        <SocialMediaScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          agentId={agent.agentId}
          platform="farcaster"
          refetchAgent={refetchAgent}
        />
      )}
    </div>
  );
}

export default FarcasterScheduledCasts;
