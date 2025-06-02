import { useState } from "react";
import { QRCode } from "@farcaster/auth-kit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";

interface FarcasterConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  uri: string;
  status: "pending_approval" | "approved" | "error";
}

export function FarcasterConnectionModal({
  isOpen,
  onClose,
  uri,
  status,
}: FarcasterConnectionModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect with Farcaster</DialogTitle>
          <DialogDescription>
            Scan the QR code with your Farcaster app to connect your account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          {status === "pending_approval" && (
            <>
              <div className="bg-white p-4 rounded-lg">
                <QRCode uri={uri} />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Open the Farcaster app and scan this code to authorize the
                connection.
              </p>
            </>
          )}

          {status === "approved" && (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-medium">Connection Authorized!</h3>
              <p className="text-sm text-muted-foreground">
                Your Farcaster account has been successfully connected.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="font-medium">Connection Error</h3>
              <p className="text-sm text-muted-foreground">
                An error occurred while connecting your Farcaster account.
                Please try again.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {status === "approved" && <Button onClick={onClose}>Continue</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FarcasterConnectionModal;
