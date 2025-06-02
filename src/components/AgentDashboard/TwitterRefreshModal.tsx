// react
import { useState } from "react";

// components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { useToast } from "@/components/shadcn/use-toast";

// icons
import { FaXTwitter } from "react-icons/fa6";
import { AlertCircle } from "lucide-react";

interface TwitterRefreshModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  onSuccess?: () => void;
}

export function TwitterRefreshModal({
  isOpen,
  onClose,
  agentId,
  onSuccess,
}: TwitterRefreshModalProps) {
  const [authCookie, setAuthCookie] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [twid, setTwid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!authCookie || !csrfToken || !twid) {
      toast({
        title: "Please enter all Twitter cookies",
        variant: "destructive",
      });
      return;
    }

    const decodedTwid = decodeURIComponent(twid);

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/agents/${agentId}/twitter/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId,
          authCookie,
          csrfToken,
          twid: decodedTwid,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Twitter credentials updated successfully",
        variant: "default",
      });

      // Reset form and close modal after 2 seconds
      setTimeout(() => {
        setAuthCookie("");
        setCsrfToken("");
        setTwid("");
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error refreshing Twitter credentials:", error);
      toast({
        title: "Error updating Twitter credentials",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaXTwitter className="h-5 w-5 text-blue-400" />
            Update Twitter Credentials
          </DialogTitle>
          <DialogDescription>
            Enter your new Twitter cookies to refresh your credentials
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="authCookie">Authentication cookie</Label>
            <Input
              id="authCookie"
              placeholder="auth_token=..."
              value={authCookie}
              onChange={(e) => setAuthCookie(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Your Twitter account authentication cookie (auth_token)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csrfToken">CSRF Token</Label>
            <Input
              id="csrfToken"
              placeholder="ct0=..."
              value={csrfToken}
              onChange={(e) => setCsrfToken(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Your Twitter account CSRF token (ct0)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twid">Twid</Label>
            <Input
              id="twid"
              placeholder="twid=..."
              value={twid}
              onChange={(e) => setTwid(e.target.value)}
            />
            <p className="text-xs text-gray-500">Your Twitter account twid</p>
          </div>

          <div className="rounded-md bg-blue-50 p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  How to get your Twitter cookies
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Login to Twitter.com</li>
                    <li>
                      Open the developer tools (F12 or right-click → Inspect)
                    </li>
                    <li>
                      Go to the &quot;Application&quot; or &quot;Storage&quot;
                      tab
                    </li>
                    <li>
                      Search for &quot;Cookies&quot; and select
                      &quot;twitter.com&quot;
                    </li>
                    <li>
                      Copy the values of &quot;auth_token&quot;, &quot;ct0&quot;
                      and &quot;twid&quot;
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
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
                Updating...
              </span>
            ) : (
              <span className="flex items-center gap-2 text-white">
                <FaXTwitter className="h-4 w-4" />
                Update Credentials
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TwitterRefreshModal;
