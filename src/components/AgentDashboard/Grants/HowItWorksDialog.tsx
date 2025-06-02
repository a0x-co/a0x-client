"use client";

import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import { HelpCircle } from "lucide-react";
import Image from "next/image";

export function HowItWorksDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">How it works</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            🔍 How the Grant System Works on Base Network
          </DialogTitle>
          <DialogDescription>
            Step-by-step guide to the grant management process on Base
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="rounded-lg border border-gray-200 shadow-sm">
              <Image
                src="/assets/diagram.png"
                alt="Grant process flow"
                width={600}
                height={300}
                className="w-full h-auto"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Diagram of the complete grant process flow on Base network
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">📩 1. Request Reception</h3>
            <p>
              The process begins when a contributor sends a grant request
              through the system. The message includes information about their
              contribution to the project and relevant data such as the GitHub
              repository. (Eg: &quot;@JesseXBT check my project
              https://github.com/a0x-company/JesseXBT &quot;)
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">🔍 2. Repository Scraping</h3>
            <p>
              The autonomous agent scans the GitHub repository mentioned in the
              request. During this process:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analyzes the commits and contributions of the applicant</li>
              <li>Verifies the authenticity of the contribution</li>
              <li>Collects code quality metrics</li>
              <li>Evaluates the impact of the contribution on the project</li>
              <li>
                Critically assesses associated websites and online presence
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">🔬 3. Request Evaluation</h3>
            <p>Once the information is collected, the supervisor can review:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Repository details and contribution</li>
              <li>Code quality metrics collected by the agent</li>
              <li>Social activity and interactions of the contributor</li>
              <li>History of previous contributions</li>
              <li>Website and online presence assessment</li>
            </ul>
            <p>
              Based on this information, they can approve or deny the request
              using the corresponding buttons in the interface.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">💼 4. Wallet Management</h3>
            <p>
              The system automatically obtains the wallet address of the
              applicant that will be used to send the grant. This information is
              displayed in the interface for verification.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                For messages sent via Farcaster, the system automatically
                detects and retrieves the associated wallet address
              </li>
              <li>
                This integration streamlines the process and ensures accurate
                wallet information
              </li>
              <li>
                The supervisor can verify the wallet before proceeding with the
                grant
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">💸 5. Grant Sending</h3>
            <p>Currently, grants are sent manually through the Base network:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                The supervisor verifies there is sufficient USDC balance in the
                wallet on Base
              </li>
              <li>Adjusts the grant amount if necessary</li>
              <li>
                Initiates the transaction using the &quot;Send Grant&quot;
                button
              </li>
              <li>
                Confirms that the transaction has been completed successfully on
                the Base blockchain
              </li>
            </ul>
            <p>
              Once the transaction is complete, the grant status changes to
              &quot;Paid&quot; and the USDC balance in the account is updated.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-muted-foreground">
              Note: This process is continuously being optimized. In the future,
              we plan to integrate with Talent Protocol to validate wallets and
              builder scores, automate grant disbursements on Base, and enhance
              the ability to critically evaluate not just GitHub repositories
              but associated websites and online presence as well.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
