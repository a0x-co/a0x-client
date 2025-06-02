import { ethers } from "ethers";

// Direcciones de contratos
export const ADDRESSES = {
  WETH: "0x4200000000000000000000000000000000000006",
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  A0X: "0x820C5F0fB255a1D18fd0eBB0F1CCefbC4D546dA7",
  CBBTC: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
  UNISWAP_QUOTER: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a", // Uniswap V3 Quoter address on Base
};

// Configuración de tokens con sus decimales
export const TOKEN_CONFIG = {
  WETH: {
    address: ADDRESSES.WETH,
    decimals: 18,
  },
  USDC: {
    address: ADDRESSES.USDC,
    decimals: 6,
  },
  CBBTC: {
    address: ADDRESSES.CBBTC,
    decimals: 8,
  },
  A0X: {
    address: ADDRESSES.A0X,
    decimals: 18,
  },
};

// ABI para el contrato Quoter de Uniswap
export const QUOTER_ABI = [
  "function quoteExactInput(bytes memory path, uint256 amountIn) external returns (uint256 amountOut)",
];

// Fee tiers para cada par
export const SWAP_ROUTES = {
  WETH_USDC: { path: [ADDRESSES.WETH, ADDRESSES.USDC], fees: [3000] }, // 0.3%
  CBBTC_USDC: { path: [ADDRESSES.CBBTC, ADDRESSES.USDC], fees: [500] }, // 0.05%
  A0X_WETH: { path: [ADDRESSES.A0X, ADDRESSES.WETH], fees: [10000] }, // 1%
};

/**
 * Codifica la ruta para swaps multi-hop según el formato esperado por Uniswap v3
 */
export function encodePath(path: string[], fees: number[]): string {
  if (path.length !== fees.length + 1) {
    throw new Error("La longitud de path/fee no coincide");
  }

  let encoded = "0x";
  for (let i = 0; i < fees.length; i++) {
    // Formato: path[i] + fee + path[i+1]
    encoded += path[i].slice(2);
    encoded += fees[i].toString(16).padStart(6, "0");
    encoded += path[i + 1].slice(2);
  }
  return encoded;
}

/**
 * Ejecuta una operación con reintentos automáticos en caso de fallos de RPC
 * @param operation Función que realiza la operación blockchain
 * @param maxRetries Número máximo de reintentos
 * @returns Resultado de la operación
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Verificar si el error está relacionado con el RPC
      const isRpcError =
        error.message?.includes("network") ||
        error.message?.includes("connection") ||
        error.message?.includes("timeout") ||
        error.message?.includes("server") ||
        error.message?.includes("request failed");

      if (!isRpcError) {
        // Si no es un error de RPC, no tiene sentido reintentar
        throw error;
      }

      console.warn(
        `Error de RPC en intento ${attempt + 1}/${maxRetries}:`,
        error.message
      );

      if (attempt < maxRetries - 1) {
        // Esperar antes de reintentar (backoff exponencial)
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 8000);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

/**
 * Obtiene la cotización para un input exacto utilizando el contrato Quoter
 */
export async function quoteExactInput(
  provider: ethers.JsonRpcProvider,
  path: string[],
  fees: number[],
  amountIn: string,
  tokenInDecimals: number,
  tokenOutDecimals: number
): Promise<number | null> {
  try {
    return await withRetry(async () => {
      const quoterContract = new ethers.Contract(
        ADDRESSES.UNISWAP_QUOTER,
        QUOTER_ABI,
        provider
      );
      const encodedPath = encodePath(path, fees);
      const amountInWei = ethers.parseUnits(amountIn, tokenInDecimals);

      console.log(
        `Obteniendo cotización: ${path[0]} -> ${path[path.length - 1]}`
      );
      console.log(`Path: ${path.join(" -> ")}, Fees: ${fees.join(", ")}`);

      try {
        const amountOut = await quoterContract.quoteExactInput.staticCall(
          encodedPath,
          amountInWei
        );
        const readableAmount = ethers.formatUnits(amountOut, tokenOutDecimals);

        console.log(
          `Resultado: 1 ${path[0]} = ${readableAmount} ${path[path.length - 1]}`
        );
        return parseFloat(readableAmount);
      } catch (error) {
        console.error("Error al obtener cotización:", error);
        return null;
      }
    });
  } catch (error) {
    console.error("Error en quoteExactInput con reintentos:", error);
    return null;
  }
}
