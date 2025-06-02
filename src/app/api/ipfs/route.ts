import { Uploader } from "@irys/upload";
import { BaseEth } from "@irys/upload-ethereum";
import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";

// Constantes de configuración
const privateKey = process.env.PRIVATE_KEY || "";
const priceETHinUSD = 1800;
const LOGGING_ENABLED = true;

// Función para agregar logs detallados
const logger = {
  info: (message: string, data?: any) => {
    if (LOGGING_ENABLED) {
      if (data) {
        console.log(`[INFO] ${message}`, data);
      } else {
        console.log(`[INFO] ${message}`);
      }
    }
  },
  error: (message: string, error?: any) => {
    if (LOGGING_ENABLED) {
      if (error) {
        console.error(`[ERROR] ${message}`, error);
      } else {
        console.error(`[ERROR] ${message}`);
      }
    }
  },
  warn: (message: string, data?: any) => {
    if (LOGGING_ENABLED) {
      if (data) {
        console.warn(`[WARN] ${message}`, data);
      } else {
        console.warn(`[WARN] ${message}`);
      }
    }
  },
};

const getIrysUploader = async () => {
  logger.info("Inicializando Irys Uploader");
  const irysUploader = await Uploader(BaseEth).withWallet(privateKey);
  logger.info("Irys Uploader inicializado correctamente");
  return irysUploader;
};

export async function POST(request: NextRequest) {
  logger.info("Iniciando proceso de carga a IPFS");
  try {
    const startTime = Date.now();
    const irysUploader = await getIrysUploader();

    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const signer = new ethers.Wallet(privateKey || "", provider);

    // Verificar balance
    logger.info("Verificando balance en Irys");
    const balance = await irysUploader.getBalance(signer.address);
    const balanceInETH = irysUploader.utils.fromAtomic(balance);
    const balanceInUSD = Number(balanceInETH) * priceETHinUSD;

    logger.info(
      `Balance actual: ${balanceInETH} ETH, ${balanceInUSD} USD (${balance} winston)`
    );

    if (balance.isZero()) {
      logger.error(
        "No hay suficiente balance. Por favor, fondea tu wallet en Irys."
      );
      return NextResponse.json(
        {
          success: false,
          error: "No hay suficiente balance en la cuenta de Irys",
        },
        { status: 500 }
      );
    }

    // // MOCK
    // return NextResponse.json({
    //   success: true,
    //   file: {
    //     id: "763dVwRQt162Jevn9UF2CQzfu9EfwDB7ep7Jhc1DxCDv",
    //     url: "https://gateway.irys.xyz/763dVwRQt162Jevn9UF2CQzfu9EfwDB7ep7Jhc1DxCDv",
    //     size: 183488,
    //     type: "image/png",
    //   },
    //   processingTime: "3276ms",
    // });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const contentType = formData.get("contentType") as string;
    const metadata = formData.get("metadata") as string;
    const description = formData.get("description") as string;
    const name = formData.get("name") as string;
    const generateMetadata = formData.get("generateMetadata") === "true";
    const customTags = formData.get("tags") as string;

    if (!file) {
      logger.error("No se proporcionó ningún archivo");
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 }
      );
    }

    // Configuramos tags básicos
    const tags = [
      {
        name: "Content-Type",
        value: contentType || file.type,
      },
      {
        name: "App-Name",
        value: "A0X-Mirror",
      },
      {
        name: "Upload-Timestamp",
        value: new Date().toISOString(),
      },
    ];

    // Si el archivo es JSON, agregar tag específico
    const isJsonFile = (contentType || file.type) === "application/json";
    if (isJsonFile) {
      tags.push({
        name: "Type",
        value: "metadata",
      });
      logger.info("Detectado archivo JSON de metadatos");
    }

    // Agregar tags personalizados si se proporcionaron
    if (customTags) {
      try {
        const parsedTags = JSON.parse(customTags);
        if (Array.isArray(parsedTags)) {
          tags.push(...parsedTags);
        }
      } catch (error) {
        logger.warn(
          "Error al parsear tags personalizados, se ignorarán",
          error
        );
      }
    }

    logger.info(`Subiendo archivo "${file.name}" (${file.size} bytes)`);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Si es un archivo JSON, validar que sea un JSON válido
    if (isJsonFile) {
      try {
        const jsonContent = fileBuffer.toString("utf-8");
        JSON.parse(jsonContent);
        logger.info("JSON validado correctamente");
      } catch (error) {
        logger.error("El archivo no contiene un JSON válido", error);
        return NextResponse.json(
          {
            success: false,
            error: "El archivo no contiene un JSON válido",
          },
          { status: 400 }
        );
      }
    }

    // Realizar la carga del archivo
    logger.info("Iniciando upload a Irys");
    const receipt = await irysUploader.upload(fileBuffer, { tags });
    logger.info(`Archivo subido correctamente. ID: ${receipt.id}`);

    if (isJsonFile) {
      logger.info(`Metadata JSON subido con ID: ${receipt.id}`);
      logger.info(`URL accesible: https://gateway.irys.xyz/${receipt.id}`);

      // Verificación extra para asegurar que sea accesible
      try {
        const verificationUrl = `https://gateway.irys.xyz/${receipt.id}`;
        logger.info(`Verificando accesibilidad en: ${verificationUrl}`);

        // No esperamos respuesta, solo verificamos que se pueda realizar la llamada
        // Esta es una comprobación opcional para debug
        fetch(verificationUrl).catch((e) =>
          logger.warn(
            `No se pudo verificar la URL, pero esto es solo una advertencia: ${e.message}`
          )
        );
      } catch (error) {
        logger.warn("Error en verificación (no crítico)", error);
      }
    }

    // Si se solicitó generar metadata
    let metadataReceipt = null;
    if (generateMetadata && (metadata || name)) {
      logger.info("Generando metadata para el archivo");
      const fileMetadata = metadata ? JSON.parse(metadata) : {};

      const metadataObject = {
        ...fileMetadata,
        name: name || fileMetadata.name || `File-${Date.now()}`,
        description: description || fileMetadata.description || "",
        image: `https://gateway.irys.xyz/${receipt.id}`,
        attributes: fileMetadata.attributes || [],
        imageId: receipt.id,
        fileName: file.name,
        uploadTimestamp: new Date().toISOString(),
      };

      // Subir metadata
      logger.info("Subiendo metadata a Irys");
      metadataReceipt = await irysUploader.upload(
        JSON.stringify(metadataObject),
        {
          tags: [
            { name: "Content-Type", value: "application/json" },
            { name: "Image-TX", value: receipt.id },
            { name: "Type", value: "metadata" },
          ],
        }
      );
      logger.info(`Metadata subida correctamente. ID: ${metadataReceipt.id}`);
    }

    const endTime = Date.now();
    logger.info(`Proceso completado en ${endTime - startTime}ms`);

    // Preparar respuesta
    const response: {
      success: boolean;
      file: {
        id: string;
        url: string;
        size: number;
        type: string;
      };
      processingTime: string;
      metadata?: {
        id: string;
        url: string;
        mutableUrl: string;
      };
    } = {
      success: true,
      file: {
        id: receipt.id,
        url: `https://gateway.irys.xyz/${receipt.id}`,
        size: file.size,
        type: contentType || file.type,
      },
      processingTime: `${endTime - startTime}ms`,
    };

    // Agregar metadata a la respuesta si fue generada
    if (metadataReceipt) {
      response.metadata = {
        id: metadataReceipt.id,
        url: `https://gateway.irys.xyz/${metadataReceipt.id}`,
        mutableUrl: `https://gateway.irys.xyz/mutable/${metadataReceipt.id}`,
      };
    }

    return NextResponse.json(response);
  } catch (e) {
    logger.error("Error durante el proceso de upload", e);
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Unknown error",
        stack: e instanceof Error ? e.stack : undefined,
      },
      { status: 500 }
    );
  }
}
