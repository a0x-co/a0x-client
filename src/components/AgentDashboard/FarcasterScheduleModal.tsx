import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { Calendar, Clock, RefreshCw, Send } from "lucide-react";

interface FarcasterScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
}

export function FarcasterScheduleModal({
  isOpen,
  onClose,
  agentId,
}: FarcasterScheduleModalProps) {
  const [instruction, setInstruction] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [recurringPattern, setRecurringPattern] = useState<string>("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!instruction.trim()) {
      setSubmitResult({
        success: false,
        message: "Instruction is required",
      });
      return;
    }

    if (!scheduleDate || !scheduleTime) {
      setSubmitResult({
        success: false,
        message: "Date and time are required",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitResult(null);

      // Combine date and time in ISO format
      const scheduleTimeISO = new Date(
        `${scheduleDate}T${scheduleTime}:00`
      ).toISOString();

      // Prepare payload with recurring pattern only if not "none"
      const payload: {
        agentId: string;
        instruction: string;
        scheduleTime: string;
        recurringPattern: string;
      } = {
        agentId,
        instruction,
        scheduleTime: scheduleTimeISO,
        recurringPattern: recurringPattern,
      };

      const response = await axios.post("/api/scheduled-posts", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setSubmitResult({
        success: true,
        message: "Cast scheduled successfully",
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        setInstruction("");
        setScheduleDate("");
        setScheduleTime("");
        setRecurringPattern("none");
        setSubmitResult(null);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error scheduling cast:", error);
      setSubmitResult({
        success: false,
        message: "Error scheduling cast. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Cast on Farcaster</DialogTitle>
          <DialogDescription>
            Configure when and what your agent should post on Farcaster
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Instruction for the agent
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="E.g.: Share an update about the crypto market focusing on Bitcoin and Ethereum"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-24"
            />
            <p className="text-xs text-gray-500">
              Describe what you want your agent to post. Be specific for better
              results.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Date
              </label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" /> Time
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <RefreshCw className="h-4 w-4" /> Recurring pattern
            </label>
            <select
              value={recurringPattern}
              onChange={(e) => setRecurringPattern(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="none">No repetition</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {submitResult && (
            <div
              className={`p-3 rounded-md ${
                submitResult.success
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {submitResult.message}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 text-white">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Scheduling...
              </span>
            ) : (
              <span className="flex items-center gap-2 text-white">
                <Send className="h-4 w-4" />
                Schedule Cast
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FarcasterScheduleModal;
