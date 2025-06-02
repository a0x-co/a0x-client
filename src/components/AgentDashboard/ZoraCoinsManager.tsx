// React
import { useEffect, useState, useRef } from "react";

// Next
import Image from "next/image";

// Types
import { Agent } from "@/types";
import { Address, encodeAbiParameters, parseAbiParameters } from "viem";

// Components
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";

// Icons
import {
  AlertCircle,
  Calendar,
  Check,
  Coins,
  FileUp,
  ImageIcon,
  Loader2,
  Plus,
  Upload,
} from "lucide-react";

// Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// WAGMI
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";

// Zora Coins SDK
import { createCoinCall, getCoinCreateFromLogs } from "@zoralabs/coins-sdk";
import { usePrivy, useWallets, useSendTransaction } from "@privy-io/react-auth";
import { base } from "viem/chains";

// Irys for IPFS uploads
// import { WebIrys } from "@irys/sdk";
import { ethers } from "ethers";

import axios from "axios";

// Form schema for creating a coin
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(5, "Maximum 5 characters"),
  description: z.string().optional(),
  initialPurchaseWei: z.string().optional(),
});

interface ZoraCoinsManagerProps {
  agent: Agent;
  refetchAgent: () => void;
  walletAddress: string;
}

export function ZoraCoinsManager({
  agent,
  refetchAgent,
  walletAddress,
}: ZoraCoinsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    hash?: string;
    address?: string;
  } | null>(null);
  const [userCoins, setUserCoins] = useState<
    Array<{
      name: string;
      symbol: string;
      address: string;
      createdAt: Date;
    }>
  >([
    // Example data, in a real implementation these would come from the API
    // {
    //   name: "Agent Coin",
    //   symbol: "AGENT",
    //   address: "0x1234...5678",
    //   createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    // },
  ]);

  // File upload states
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUri, setUploadedUri] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      initialPurchaseWei: "0",
    },
  });

  const publicClient = usePublicClient();
  const { wallets } = useWallets();
  const { user } = usePrivy();
  const { sendTransaction } = useSendTransaction();

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Upload to IPFS via Irys
  const uploadToIrys = async () => {
    if (!file || !wallets || wallets.length === 0) return null;

    setIsUploading(true);
    setError(null);

    try {
      const wallet = wallets[0];
      await wallet.switchChain(base.id);

      const formValues = form.getValues();

      // 1. Primero subir la imagen
      const imageFormData = new FormData();
      imageFormData.append("file", file);
      imageFormData.append("contentType", file.type);

      const imageResponse = await axios.post("/api/ipfs", imageFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Verificar si la carga de imagen fue exitosa
      if (!imageResponse.data.success) {
        throw new Error(
          `Error al subir imagen: ${
            imageResponse.data.error || "Error desconocido"
          }`
        );
      }

      const imageUrl = imageResponse.data.file.url;
      console.log("Imagen subida correctamente:", imageUrl);

      // 2. Crear y subir el archivo de metadatos JSON
      const metadata = {
        name: formValues.name,
        description:
          formValues.description ||
          `${formValues.name} - ${formValues.symbol} coin`,
        image: imageUrl,
        symbol: formValues.symbol,
        external_url: `https://zora.co/`,
        attributes: [],
      };

      // Convertir el objeto de metadatos a un archivo
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      const metadataFile = new File([metadataBlob], "metadata.json", {
        type: "application/json",
      });

      // Subir el archivo JSON de metadatos
      const metadataFormData = new FormData();
      metadataFormData.append("file", metadataFile);
      metadataFormData.append("contentType", "application/json");

      const metadataResponse = await axios.post("/api/ipfs", metadataFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Verificar si la carga de metadatos fue exitosa
      if (!metadataResponse.data.success) {
        throw new Error(
          `Error al subir metadatos: ${
            metadataResponse.data.error || "Error desconocido"
          }`
        );
      }

      const metadataUrl = metadataResponse.data.file.url;
      console.log("Metadatos subidos correctamente:", metadataUrl);

      setUploadedUri(metadataUrl);
      return metadataUrl;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error en la solicitud:", errorMessage);
      setError(`Error al subir a IPFS: ${errorMessage}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Prepare the transaction to create the coin
  const getCoinCallParams = async (irysUri: string) => {
    try {
      const formValues = form.getValues();

      if (!irysUri) {
        throw new Error("No Irys URI available");
      }

      // Validar que la URI contiene un JSON válido
      try {
        const response = await fetch(irysUri);
        if (!response.ok) {
          throw new Error(`Error fetching metadata: ${response.statusText}`);
        }
        const metadata = await response.json();
        console.log("Metadata validado correctamente:", metadata);
      } catch (error) {
        console.error("Error validando metadata:", error);
        throw new Error(
          `Metadata no válido: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }

      const params: any = {
        name: formValues.name,
        symbol: formValues.symbol,
        uri: irysUri,
        payoutRecipient: walletAddress as Address,
      };

      // Add initialPurchaseWei if it exists
      if (
        formValues.initialPurchaseWei &&
        formValues.initialPurchaseWei !== "0"
      ) {
        params.initialPurchaseWei = BigInt(formValues.initialPurchaseWei);
      }
      console.log("params", params);
      return await createCoinCall(params);
    } catch (error) {
      console.error("Error creating contract parameters:", error);
      setError(
        `Error preparing parameters: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return null;
    }
  };

  // Hooks to interact with the contract
  const {
    writeContract,
    isPending,
    error: writeError,
    data: txHash,
    reset: resetWrite,
  } = useWriteContract();

  // Wait to receive transaction confirmation
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Process logs to get coin address when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && receipt && publicClient) {
      try {
        const coinDeployment = getCoinCreateFromLogs(receipt);

        if (coinDeployment && coinDeployment.coin) {
          console.log("Deployed coin address:", coinDeployment.coin);

          setSuccessData({
            hash: txHash,
            address: coinDeployment.coin,
          });

          // Update user's coin list
          const formValues = form.getValues();
          const newCoin = {
            name: formValues.name,
            symbol: formValues.symbol,
            address: coinDeployment.coin,
            createdAt: new Date(),
          };

          setUserCoins((prevCoins) => [newCoin, ...prevCoins]);
          setIsModalOpen(false);
          form.reset();
          setFile(null);
          setFilePreview(null);
          setUploadedUri(null);
        }
      } catch (error) {
        console.error("Error processing logs:", error);
      }
    }
  }, [isConfirmed, receipt, publicClient, form, txHash]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      setError(`Error creating coin: ${writeError.message}`);
    }
  }, [writeError]);

  // Make sure to be on Base network
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      wallets[0].switchChain(base.id).catch(console.error);
    }
  }, [wallets]);

  // Function to create the coin
  const onSubmit = async () => {
    setError(null);
    resetWrite();

    try {
      // First, upload the file to IPFS if we have one
      if (!file) {
        setError("Please upload a media file first");
        return;
      }

      // const irysUri = await uploadToIrys();
      const irysUri =
        "https://gateway.irys.xyz/6eyAuiDBrWMcjqZ96QrbrXpWKeMp9iRTniDWMP4eD9qM";

      if (!irysUri) {
        setError("Failed to upload media to Irys");
        return;
      }

      const contractParams = await getCoinCallParams(irysUri);

      if (!contractParams) {
        setError("Error preparing contract parameters");
        return;
      }

      // Execute the transaction
      writeContract({
        address: contractParams.address,
        abi: contractParams.abi,
        functionName: contractParams.functionName,
        args: contractParams.args,
        value: contractParams.value,
      });
    } catch (error) {
      console.error("Error sending transaction:", error);
      setError(
        `Error creating coin: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Coins className="h-6 w-6 text-indigo-600" />
          <h3 className="text-xl font-semibold text-gray-800">My Coins</h3>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 h-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Coin
        </Button>
      </div>

      {successData && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-5 flex items-start gap-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
            <Check className="h-3 w-3 text-green-600" />
          </div>
          <div>
            <p className="text-base font-medium text-green-700">
              Coin created successfully!
            </p>
            <p className="text-sm text-green-600">
              Transaction hash: {successData.hash}
            </p>
            {successData.address && (
              <p className="text-sm text-green-600">
                Coin address: {successData.address}
              </p>
            )}
          </div>
        </div>
      )}

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-base text-red-700">{error}</p>
        </div>
      ) : userCoins.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-center">
          <p className="text-base text-blue-700">
            No coins created yet. Create your first coin in Zora!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userCoins.map((coin, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-800 font-bold">
                        {coin.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-800">
                        {coin.name}
                      </h4>
                      <p className="text-sm font-medium text-indigo-600">
                        ${coin.symbol}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {coin.address}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      <span>
                        Created: {coin.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 p-2 h-auto"
                  onClick={() =>
                    window.open(
                      `https://basescan.org/address/${coin.address}`,
                      "_blank"
                    )
                  }
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for creating coin */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] min-w-[1040px] w-full">
          <DialogHeader>
            <DialogTitle>Create New Coin</DialogTitle>
            <DialogDescription>
              Complete the details to create your new coin in Zora.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 grid grid-cols-2 gap-4"
            >
              {/* Media Upload Section */}
              <div className="border-b pb-6 col-span-2">
                <h3 className="text-sm font-medium mb-4">Coin Media</h3>

                <div className="flex flex-col items-center justify-center">
                  {filePreview ? (
                    <div className="relative w-full h-[200px] mb-4">
                      <Image
                        src={filePreview}
                        alt="Coin media preview"
                        layout="fill"
                        objectFit="contain"
                        className="rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-[140px] bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*"
                  />

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUploadClick}
                      className="flex items-center"
                    >
                      <FileUp className="mr-2 h-4 w-4" />
                      {filePreview ? "Change Media" : "Upload Media"}
                    </Button>
                  </div>

                  {uploadedUri && (
                    <div className="w-full mt-3 bg-green-50 rounded-md p-2 text-sm text-green-600 flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      <span className="truncate">
                        Metadata uploaded to {uploadedUri}
                      </span>
                    </div>
                  )}

                  {isUploading && (
                    <div className="w-full mt-3 bg-blue-50 rounded-md p-2 text-sm text-blue-600 flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span>Uploading files to IPFS...</span>
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Coin" {...field} />
                    </FormControl>
                    <FormDescription>
                      The full name of your coin
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="MAC" {...field} />
                    </FormControl>
                    <FormDescription>
                      The short symbol (maximum 5 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A description of your coin"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of your coin
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialPurchaseWei"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Purchase (Wei)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Initial amount to purchase in Wei (can be 0)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || isConfirming || isUploading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isPending || isConfirming || isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading
                        ? "Uploading..."
                        : isConfirming
                        ? "Confirming..."
                        : "Creating..."}
                    </>
                  ) : (
                    "Create Coin"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
