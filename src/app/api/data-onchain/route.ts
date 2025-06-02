// next
import { NextResponse } from "next/server";

// constants
import PoolContractABI from "./poolContract-abi.json";

// ethers
import { ethers } from "ethers";
import { base } from "viem/chains";
import {
  ADDRESSES,
  quoteExactInput,
  SWAP_ROUTES,
  TOKEN_CONFIG,
} from "./service";

const providerUrl = base.rpcUrls.default.http[0];

// ABIs comunes reutilizables
const COMMON_ABIS = {
  ERC20_BASIC: [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
  ],
  ERC20_BALANCE: ["function balanceOf(address account) view returns (uint256)"],
  UNISWAP_V3_POOL: [
    "function liquidity() view returns (uint128)",
    "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function fee() view returns (uint24)",
  ],
};

// Función para crear un proveedor
const createProvider = () => {
  return new ethers.JsonRpcProvider(providerUrl);
};

// Función para crear un contrato con un ABI específico
const createContract = (
  address: string,
  abi: any,
  provider: ethers.JsonRpcProvider
) => {
  return new ethers.Contract(address, abi, provider);
};

// Función para crear un contrato ERC20 básico
const createERC20Contract = (
  address: string,
  provider: ethers.JsonRpcProvider
) => {
  return createContract(address, COMMON_ABIS.ERC20_BASIC, provider);
};

// Función para crear un contrato para consultar balances
const createBalanceContract = (
  address: string,
  provider: ethers.JsonRpcProvider
) => {
  return createContract(address, COMMON_ABIS.ERC20_BALANCE, provider);
};

// Función para crear un contrato de pool de Uniswap V3
const createUniswapV3PoolContract = (
  address: string,
  provider: ethers.JsonRpcProvider
) => {
  return createContract(address, COMMON_ABIS.UNISWAP_V3_POOL, provider);
};

// Función para crear un contrato de pool completo (con todos los métodos necesarios)
const createPoolContract = (
  address: string,
  provider: ethers.JsonRpcProvider
) => {
  return createContract(address, PoolContractABI, provider);
};

const getPrice = async (address: string) => {
  const provider = createProvider();
  const poolContract = createPoolContract(address, provider);

  try {
    const slot0 = await poolContract.slot0();
    const sqrtPriceX96 = slot0.sqrtPriceX96;

    // Obtener información de los tokens
    const token0 = await poolContract.token0();
    const token1 = await poolContract.token1();

    // Obtener decimales de los tokens usando la función reutilizable
    const token0Contract = createContract(
      token0,
      ["function decimals() view returns (uint8)"],
      provider
    );
    const token1Contract = createContract(
      token1,
      ["function decimals() view returns (uint8)"],
      provider
    );

    const decimals0 = Number(await token0Contract.decimals());
    const decimals1 = Number(await token1Contract.decimals());

    // Convertir BigInt a Number antes de realizar operaciones matemáticas
    const sqrtPriceX96AsNumber = Number(sqrtPriceX96.toString());

    // Calcular precios usando solo valores Number
    const price0to1 =
      (sqrtPriceX96AsNumber / Math.pow(2, 96)) ** 2 *
      Math.pow(10, decimals0 - decimals1);
    const price1to0 = 1 / price0to1;

    console.log(`Precio token0/token1:`, price0to1.toFixed(6));
    console.log(`Precio token1/token0:`, price1to0.toFixed(6));

    return {
      token0,
      token1,
      price0to1,
      price1to0,
      decimals0,
      decimals1,
    };
  } catch (error) {
    console.error("Error al obtener la información del pool:", error);
    return { error: "Error fetching pool data" };
  } finally {
    provider.destroy();
  }
};

// Función unificada para obtener precios en USDC
const getTokenPriceInUSDC = async (
  tokenSymbol: string | undefined
): Promise<number> => {
  const provider = createProvider();

  try {
    if (tokenSymbol === "WETH") {
      return (
        (await quoteExactInput(
          provider,
          SWAP_ROUTES.WETH_USDC.path,
          SWAP_ROUTES.WETH_USDC.fees,
          "1",
          TOKEN_CONFIG.WETH.decimals,
          TOKEN_CONFIG.USDC.decimals
        )) || 0
      ); // Asegurar que siempre devuelve un número
    } else if (tokenSymbol === "CBBTC") {
      return (
        (await quoteExactInput(
          provider,
          SWAP_ROUTES.CBBTC_USDC.path,
          SWAP_ROUTES.CBBTC_USDC.fees,
          "1",
          TOKEN_CONFIG.CBBTC.decimals,
          TOKEN_CONFIG.USDC.decimals
        )) || 0
      ); // Asegurar que siempre devuelve un número
    }
  } catch (error) {
    console.error(`Error al obtener precio para ${tokenSymbol}:`, error);
  }

  // Si no es ninguno de los tokens conocidos o hay un error, devolver 0
  console.warn(
    `No se encontró ruta para obtener precio en USDC para ${tokenSymbol}`
  );
  return 0;
};

const checkPairToken = async (poolAddress: string) => {
  const provider = createProvider();
  const poolContract = createPoolContract(poolAddress, provider);

  const token1 = await poolContract.token1();

  const token1Symbol = Object.keys(ADDRESSES).find(
    (key) => ADDRESSES[key as keyof typeof ADDRESSES] === token1
  );

  return { token1Symbol };
};

const getMarketCap = async (price: number) => {
  const marketCap = price * 100000000000; // price * 100 billion
  return marketCap;
};

/**
 * Encuentra el bloque más cercano a un timestamp específico utilizando búsqueda binaria
 * @param provider Proveedor de Ethereum
 * @param targetTimestamp Timestamp objetivo (en segundos)
 * @returns Número del bloque más cercano al timestamp
 */
const findBlockByTimestamp = async (
  provider: ethers.JsonRpcProvider,
  targetTimestamp: number
): Promise<number> => {
  // Obtener el bloque más reciente
  const latestBlock = await provider.getBlockNumber();
  const latestBlockData = await provider.getBlock(latestBlock);

  if (!latestBlockData) {
    throw new Error("No se pudo obtener el bloque más reciente");
  }

  const latestBlockTimestamp = latestBlockData.timestamp;

  // Si el timestamp objetivo es posterior al último bloque, devolver el último bloque
  if (targetTimestamp >= latestBlockTimestamp) {
    return latestBlock;
  }

  // Estimar un bloque inicial para la búsqueda
  // Calculamos aproximadamente cuántos bloques hay en la diferencia de tiempo
  const timeDiff = latestBlockTimestamp - targetTimestamp;
  const avgBlockTime = 2; // Tiempo promedio de bloque en segundos para Base (2 segundos)
  const estimatedBlocksBack = Math.floor(timeDiff / avgBlockTime);

  let lowBlock = Math.max(1, latestBlock - estimatedBlocksBack * 2); // Damos margen extra
  let highBlock = latestBlock;

  // Búsqueda binaria para encontrar el bloque más cercano
  let closestBlock = lowBlock;
  let closestDiff = Number.MAX_SAFE_INTEGER;

  console.log(
    `Iniciando búsqueda binaria para timestamp ${new Date(
      targetTimestamp * 1000
    ).toISOString()}`
  );
  console.log(`Rango inicial: ${lowBlock} - ${highBlock}`);

  const MAX_ITERATIONS = 20; // Límite de iteraciones para evitar bucles infinitos
  let iterations = 0;

  while (lowBlock <= highBlock && iterations < MAX_ITERATIONS) {
    iterations++;

    // Calcular el bloque medio
    const midBlock = Math.floor((lowBlock + highBlock) / 2);

    try {
      const midBlockData = await provider.getBlock(midBlock);

      if (!midBlockData) {
        // Si no se puede obtener el bloque, reducir el rango superior
        highBlock = midBlock - 1;
        continue;
      }

      const midBlockTimestamp = midBlockData.timestamp;
      const diff = Math.abs(midBlockTimestamp - targetTimestamp);

      // Actualizar el bloque más cercano si encontramos uno mejor
      if (diff < closestDiff) {
        closestBlock = midBlock;
        closestDiff = diff;
      }

      // Si la diferencia es menor a 60 segundos, consideramos que es suficientemente preciso
      if (diff < 60) {
        console.log(
          `Bloque encontrado con precisión de ${diff} segundos: ${midBlock}`
        );
        return midBlock;
      }

      // Ajustar el rango de búsqueda
      if (midBlockTimestamp > targetTimestamp) {
        highBlock = midBlock - 1;
      } else {
        lowBlock = midBlock + 1;
      }
    } catch (error) {
      console.error(`Error al obtener el bloque ${midBlock}:`, error);
      // En caso de error, reducir el rango de búsqueda
      highBlock = midBlock - 1;
    }
  }

  console.log(
    `Búsqueda completada en ${iterations} iteraciones. Bloque más cercano: ${closestBlock} (diferencia: ${closestDiff} segundos)`
  );
  return closestBlock;
};

// Caché para almacenar eventos Swap por pool y rango de bloques
interface SwapEventsCache {
  [key: string]: {
    events: Array<ethers.Log | ethers.EventLog>;
    startBlock: number;
    endBlock: number;
    timestamp: number; // Timestamp de cuando se guardó en caché
  };
}

// Caché global para eventos Swap
const swapEventsCache: SwapEventsCache = {};

// Función para obtener una clave única para la caché
const getCacheKey = (
  poolAddress: string,
  startBlock: number,
  endBlock: number
): string => {
  return `${poolAddress}_${startBlock}_${endBlock}`;
};

// Función para verificar si hay datos en caché y si son válidos
const getFromCache = (
  poolAddress: string,
  startBlock: number,
  endBlock: number
): Array<ethers.Log | ethers.EventLog> | null => {
  const cacheKey = getCacheKey(poolAddress, startBlock, endBlock);
  const cachedData = swapEventsCache[cacheKey];

  if (!cachedData) return null;

  // Verificar si los datos en caché tienen menos de 5 minutos
  const now = Date.now();
  const cacheAge = now - cachedData.timestamp;
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

  if (cacheAge > CACHE_TTL) {
    // Datos en caché expirados
    delete swapEventsCache[cacheKey];
    return null;
  }

  return cachedData.events;
};

// Función para guardar datos en caché
const saveToCache = (
  poolAddress: string,
  startBlock: number,
  endBlock: number,
  events: Array<ethers.Log | ethers.EventLog>
): void => {
  const cacheKey = getCacheKey(poolAddress, startBlock, endBlock);
  swapEventsCache[cacheKey] = {
    events,
    startBlock,
    endBlock,
    timestamp: Date.now(),
  };
};

// Función para obtener eventos Swap con soporte de caché
const getSwapEvents = async (
  poolContract: ethers.Contract,
  startBlock: number,
  endBlock: number,
  poolAddress: string
): Promise<Array<ethers.Log | ethers.EventLog>> => {
  // Verificar si hay datos en caché
  const cachedEvents = getFromCache(poolAddress, startBlock, endBlock);
  if (cachedEvents) {
    console.log(
      `Usando datos en caché para ${poolAddress} desde el bloque ${startBlock} hasta ${endBlock}`
    );
    return cachedEvents;
  }

  // Si no hay datos en caché, obtenerlos de la blockchain
  console.log(
    `Obteniendo eventos para ${poolAddress} desde el bloque ${startBlock} hasta ${endBlock}`
  );

  // Dividir el rango en bloques más pequeños para evitar sobrecargar al proveedor
  const CHUNK_SIZE = 1000; // Consultar 1000 bloques a la vez
  let allSwapEvents: Array<ethers.Log | ethers.EventLog> = [];

  try {
    // Si el rango es pequeño, hacer una sola consulta
    if (endBlock - startBlock <= CHUNK_SIZE) {
      const swapEvents = await poolContract.queryFilter(
        poolContract.filters.Swap(),
        startBlock,
        endBlock
      );
      allSwapEvents = swapEvents;
    } else {
      // Dividir en chunks para consultas más pequeñas
      for (
        let fromBlock = startBlock;
        fromBlock < endBlock;
        fromBlock += CHUNK_SIZE
      ) {
        const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, endBlock);
        console.log(
          `Consultando eventos desde el bloque ${fromBlock} hasta ${toBlock}`
        );

        try {
          const swapEvents = await poolContract.queryFilter(
            poolContract.filters.Swap(),
            fromBlock,
            toBlock
          );
          allSwapEvents = [...allSwapEvents, ...swapEvents];
        } catch (error) {
          console.error(
            `Error al consultar eventos del bloque ${fromBlock} al ${toBlock}:`,
            error
          );
          // Continuar con el siguiente chunk en caso de error
          continue;
        }

        // Pequeña pausa para no sobrecargar al proveedor
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Guardar en caché
    saveToCache(poolAddress, startBlock, endBlock, allSwapEvents);

    return allSwapEvents;
  } catch (error) {
    console.error("Error al consultar eventos:", error);
    // En caso de error, intentar con un rango más pequeño
    try {
      const smallerRange = Math.min(500, endBlock - startBlock);
      console.log(
        `Intentando con un rango más pequeño: últimos ${smallerRange} bloques`
      );
      const swapEvents = await poolContract.queryFilter(
        poolContract.filters.Swap(),
        endBlock - smallerRange,
        endBlock
      );

      // Guardar en caché
      saveToCache(poolAddress, endBlock - smallerRange, endBlock, swapEvents);

      return swapEvents;
    } catch (error) {
      console.error("Error al consultar eventos:", error);
      return [];
    }
  }
};

// Función auxiliar para serializar objetos que pueden contener BigInt
const safeStringify = (obj: any): string => {
  return JSON.stringify(obj, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
};

// Función para determinar si una pool es Uniswap V3
const determinePoolVersion = async (
  poolAddress: string,
  provider: ethers.JsonRpcProvider
): Promise<{ version: "v3"; fee?: number }> => {
  try {
    // Usar la función reutilizable para crear el contrato
    const poolV3Contract = createUniswapV3PoolContract(poolAddress, provider);

    // Si esto funciona, es una pool V3
    const fee = await poolV3Contract.fee();
    console.log(
      `Pool ${poolAddress} identificada como Uniswap V3 con fee ${fee}`
    );
    return { version: "v3", fee: Number(fee) };
  } catch (error) {
    // Si falla, asumimos V3 por defecto
    console.log(
      `No se pudo determinar la versión de la pool ${poolAddress}, asumiendo V3`
    );
    return { version: "v3" };
  }
};

// Función para calcular el volumen a partir de eventos Swap
const calculateVolumeFromEvents = (
  events: Array<ethers.Log | ethers.EventLog>,
  priceToken1InUSDC: number,
  price0to1: number,
  token0Decimals: number,
  token1Decimals: number
): { volumeInUsdc: number; transactionCount: number } => {
  // Conjunto para almacenar hashes de transacciones únicas
  const uniqueTxHashes = new Set<string>();

  // Para debugging
  let totalAmount0 = 0;
  let totalAmount1 = 0;

  const volumeInUsdc = events.reduce((total, event) => {
    if (!("args" in event) || !event.args) return total;

    // Registrar hash de transacción si existe
    if (event.transactionHash) {
      uniqueTxHashes.add(event.transactionHash);
    }

    // Obtener los valores de los argumentos
    // En Uniswap V3, los eventos tienen amount0 y amount1
    const amount0 =
      event.args.amount0 !== undefined ? event.args.amount0 : BigInt(0);
    const amount1 =
      event.args.amount1 !== undefined ? event.args.amount1 : BigInt(0);

    // Convertir a valores absolutos (en Uniswap V3, los valores pueden ser negativos)
    const absAmount0 =
      typeof amount0 === "bigint"
        ? amount0 < 0
          ? -amount0
          : amount0
        : BigInt(0);
    const absAmount1 =
      typeof amount1 === "bigint"
        ? amount1 < 0
          ? -amount1
          : amount1
        : BigInt(0);

    // Convertir a string y luego a number con ajuste de decimales
    const amount0Adjusted =
      Number(absAmount0.toString()) / Math.pow(10, token0Decimals);
    const amount1Adjusted =
      Number(absAmount1.toString()) / Math.pow(10, token1Decimals);

    // Acumular para debugging
    totalAmount0 += amount0Adjusted;
    totalAmount1 += amount1Adjusted;

    // Calcular el volumen en USDC
    // En Uniswap V3, el volumen real es la suma del valor de ambos tokens
    // Para token0: convertimos a USDC usando price0to1 y priceToken1InUSDC
    const token0VolumeInUSDC = amount0Adjusted * price0to1 * priceToken1InUSDC;

    // Para token1: convertimos directamente a USDC usando priceToken1InUSDC
    const token1VolumeInUSDC = amount1Adjusted * priceToken1InUSDC;

    // El volumen total es la suma de ambos (en valor absoluto)
    // Dividimos por 2 porque cada swap involucra dos tokens y no queremos contar doble
    const eventVolumeInUSDC =
      (Math.abs(token0VolumeInUSDC) + Math.abs(token1VolumeInUSDC)) / 2;

    return total + eventVolumeInUSDC;
  }, 0);

  // Log para debugging
  console.log(
    `Cálculo de volumen (v3) - Total amount0: ${totalAmount0}, Total amount1: ${totalAmount1}`
  );
  console.log(
    `Precio token0/token1: ${price0to1}, Precio token1 en USDC: ${priceToken1InUSDC}`
  );
  console.log(`Volumen calculado en USDC: ${volumeInUsdc}`);

  // Redondear a 2 decimales
  const roundedVolumeInUsdc = Math.round(volumeInUsdc * 100) / 100;

  return {
    volumeInUsdc: roundedVolumeInUsdc,
    transactionCount: uniqueTxHashes.size || events.length, // Usar transacciones únicas si es posible
  };
};

// Función optimizada para obtener volumen para múltiples períodos de tiempo
const getMultiPeriodVolume = async (
  poolAddress: string,
  priceToken1InUSDC: number,
  price0to1: number,
  token0Decimals: number = 18,
  token1Decimals: number = 18
): Promise<{
  volume15m: { volumeInUsdc: number; transactionCount: number };
  volume1h: { volumeInUsdc: number; transactionCount: number };
  volume6h: { volumeInUsdc: number; transactionCount: number };
}> => {
  const provider = createProvider();

  // Determinar la versión de la pool
  const { version: poolVersion } = await determinePoolVersion(
    poolAddress,
    provider
  );
  console.log(
    `Usando versión ${poolVersion} para calcular volumen de la pool ${poolAddress}`
  );

  // Crear el contrato de pool
  const poolContract = createPoolContract(poolAddress, provider);

  // Obtener timestamp actual
  const latestBlock = await provider.getBlockNumber();
  const block = await provider.getBlock(latestBlock);
  const latestBlockTimestamp =
    block?.timestamp ?? Math.floor(Date.now() / 1000);

  // Calcular timestamps para diferentes períodos
  const timestamp15m = latestBlockTimestamp - 15 * 60;
  const timestamp1h = latestBlockTimestamp - 60 * 60;
  const timestamp6h = latestBlockTimestamp - 6 * 60 * 60;

  // Encontrar bloques correspondientes a cada timestamp
  console.log("Buscando bloques para diferentes períodos de tiempo...");
  const block15m = await findBlockByTimestamp(provider, timestamp15m);
  const block1h = await findBlockByTimestamp(provider, timestamp1h);
  const block6h = await findBlockByTimestamp(provider, timestamp6h);

  console.log(
    `Bloques encontrados: 15m=${block15m}, 1h=${block1h}, 6h=${block6h}`
  );

  try {
    // Obtener todos los eventos desde el bloque más antiguo (6h) hasta el más reciente
    const allEvents = await getSwapEvents(
      poolContract,
      block6h,
      latestBlock,
      poolAddress
    );

    console.log(`Total de eventos Swap encontrados: ${allEvents.length}`);

    // Verificar si tenemos eventos
    if (allEvents.length === 0) {
      console.log("No se encontraron eventos Swap en el período especificado");
      return {
        volume15m: { volumeInUsdc: 0, transactionCount: 0 },
        volume1h: { volumeInUsdc: 0, transactionCount: 0 },
        volume6h: { volumeInUsdc: 0, transactionCount: 0 },
      };
    }

    // Verificar la estructura de los eventos para debugging
    if (allEvents.length > 0) {
      const sampleEvent = allEvents[0];
      console.log("Muestra de evento Swap:", {
        blockNumber:
          "blockNumber" in sampleEvent ? sampleEvent.blockNumber : "N/A",
        transactionHash:
          "transactionHash" in sampleEvent
            ? sampleEvent.transactionHash
            : "N/A",
        args:
          "args" in sampleEvent && sampleEvent.args
            ? safeStringify(sampleEvent.args)
            : "N/A",
      });
    }

    // Filtrar eventos para cada período
    const events15m = allEvents.filter((event) => {
      if ("blockNumber" in event) {
        return event.blockNumber >= block15m;
      }
      return false;
    });

    const events1h = allEvents.filter((event) => {
      if ("blockNumber" in event) {
        return event.blockNumber >= block1h;
      }
      return false;
    });

    const events6h = allEvents; // Todos los eventos

    console.log(
      `Eventos por período: 15m=${events15m.length}, 1h=${events1h.length}, 6h=${events6h.length}`
    );

    // Calcular volumen para cada período
    const volume15m = calculateVolumeFromEvents(
      events15m,
      priceToken1InUSDC,
      price0to1,
      token0Decimals,
      token1Decimals
    );

    const volume1h = calculateVolumeFromEvents(
      events1h,
      priceToken1InUSDC,
      price0to1,
      token0Decimals,
      token1Decimals
    );

    const volume6h = calculateVolumeFromEvents(
      events6h,
      priceToken1InUSDC,
      price0to1,
      token0Decimals,
      token1Decimals
    );

    return {
      volume15m,
      volume1h,
      volume6h,
    };
  } catch (error) {
    console.error("Error al calcular volúmenes:", error);
    return {
      volume15m: { volumeInUsdc: 0, transactionCount: 0 },
      volume1h: { volumeInUsdc: 0, transactionCount: 0 },
      volume6h: { volumeInUsdc: 0, transactionCount: 0 },
    };
  }
};

// Interfaz para almacenar datos históricos de market cap
interface MarketCapHistory {
  [poolAddress: string]: {
    timestamps: {
      [timestamp: string]: {
        marketCap: number;
        price: number;
        volume: number;
      };
    };
  };
}

// Interfaz para los datos históricos
interface HistoricalData {
  marketCap: number;
  price: number;
  volume: number;
  timestamp: number;
}

// Interfaz para los cambios porcentuales
interface PercentageChanges {
  change15m: number | null;
  change1h: number | null;
  change6h: number | null;
  priceChange15m: number | null;
  priceChange1h: number | null;
  priceChange6h: number | null;
}

// Simulación de almacenamiento en memoria (en producción usarías Firestore u otra base de datos)
// Esta variable se reiniciará cuando se reinicie el servidor, pero sirve como ejemplo
const marketCapHistoryCache: MarketCapHistory = {};

// Función para guardar datos históricos de market cap
const saveMarketCapHistory = (
  poolAddress: string,
  marketCap: number,
  price: number,
  volume: number
): void => {
  const timestamp = Math.floor(Date.now() / 1000);

  // Inicializar la estructura si no existe
  if (!marketCapHistoryCache[poolAddress]) {
    marketCapHistoryCache[poolAddress] = { timestamps: {} };
  }

  // Guardar los datos actuales
  marketCapHistoryCache[poolAddress].timestamps[timestamp.toString()] = {
    marketCap,
    price,
    volume,
  };

  // Limpiar datos antiguos (más de 24 horas)
  const oneDayAgo = timestamp - 24 * 60 * 60;
  Object.keys(marketCapHistoryCache[poolAddress].timestamps).forEach((ts) => {
    if (Number(ts) < oneDayAgo) {
      delete marketCapHistoryCache[poolAddress].timestamps[ts];
    }
  });

  console.log(
    `Datos de market cap guardados para ${poolAddress} en timestamp ${timestamp}`
  );
};

// Función para obtener el market cap histórico más cercano a un timestamp específico
const getHistoricalMarketCap = (
  poolAddress: string,
  targetTimestamp: number,
  maxDiffSeconds: number = 300 // 5 minutos por defecto
): HistoricalData | null => {
  if (!marketCapHistoryCache[poolAddress]) {
    return null;
  }

  const timestamps = Object.keys(marketCapHistoryCache[poolAddress].timestamps)
    .map(Number)
    .sort(
      (a, b) => Math.abs(a - targetTimestamp) - Math.abs(b - targetTimestamp)
    );

  if (timestamps.length === 0) {
    return null;
  }

  const closestTimestamp = timestamps[0];
  const diff = Math.abs(closestTimestamp - targetTimestamp);

  // Si la diferencia es mayor que el máximo permitido, devolver null
  if (diff > maxDiffSeconds) {
    return null;
  }

  const closestTimestampStr = closestTimestamp.toString();
  const data =
    marketCapHistoryCache[poolAddress].timestamps[closestTimestampStr];

  return {
    marketCap: data.marketCap,
    price: data.price,
    volume: data.volume,
    timestamp: closestTimestamp,
  };
};

// Función para calcular la diferencia porcentual con formato
const calculatePercentChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  const change = ((current - previous) / previous) * 100;
  // Redondear a 2 decimales
  return Math.round(change * 100) / 100;
};

// Función para obtener datos históricos para diferentes períodos
const getHistoricalDataForPeriods = (
  poolAddress: string
): {
  data15m: HistoricalData | null;
  data1h: HistoricalData | null;
  data6h: HistoricalData | null;
} => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const timestamp15mAgo = currentTimestamp - 15 * 60;
  const timestamp1hAgo = currentTimestamp - 60 * 60;
  const timestamp6hAgo = currentTimestamp - 6 * 60 * 60;

  // Obtener datos históricos
  const data15m = getHistoricalMarketCap(poolAddress, timestamp15mAgo);
  const data1h = getHistoricalMarketCap(poolAddress, timestamp1hAgo);
  const data6h = getHistoricalMarketCap(poolAddress, timestamp6hAgo);

  return { data15m, data1h, data6h };
};

// Función para calcular las diferencias de market cap
const calculateMarketCapChanges = (
  poolAddress: string,
  currentMarketCap: number,
  currentPrice: number,
  currentVolume: number
): PercentageChanges => {
  // Guardar los datos actuales para futuras comparaciones
  saveMarketCapHistory(
    poolAddress,
    currentMarketCap,
    currentPrice,
    currentVolume
  );

  // Obtener datos históricos para diferentes períodos
  const { data15m, data1h, data6h } = getHistoricalDataForPeriods(poolAddress);

  // Calcular cambios porcentuales
  const change15m = data15m
    ? calculatePercentChange(currentMarketCap, data15m.marketCap)
    : null;
  const change1h = data1h
    ? calculatePercentChange(currentMarketCap, data1h.marketCap)
    : null;
  const change6h = data6h
    ? calculatePercentChange(currentMarketCap, data6h.marketCap)
    : null;

  // Calcular cambios de precio
  const priceChange15m = data15m
    ? calculatePercentChange(currentPrice, data15m.price)
    : null;
  const priceChange1h = data1h
    ? calculatePercentChange(currentPrice, data1h.price)
    : null;
  const priceChange6h = data6h
    ? calculatePercentChange(currentPrice, data6h.price)
    : null;

  return {
    change15m,
    change1h,
    change6h,
    priceChange15m,
    priceChange1h,
    priceChange6h,
  };
};

// Función para obtener las reservas de una pool y calcular la liquidez en USDC
const getPoolLiquidity = async (
  poolAddress: string,
  provider: ethers.JsonRpcProvider,
  token0Decimals: number,
  token1Decimals: number,
  priceToken0InUSDC: number,
  priceToken1InUSDC: number
): Promise<{
  token0Reserve: string;
  token1Reserve: string;
  token0ReserveFormatted: number;
  token1ReserveFormatted: number;
  token0ValueUSDC: number;
  token1ValueUSDC: number;
  totalLiquidityUSDC: number;
}> => {
  try {
    // Usar la función reutilizable para crear el contrato
    const poolContract = createUniswapV3PoolContract(poolAddress, provider);

    // Obtener liquidez y precio actual
    const liquidity = await poolContract.liquidity();
    const slot0 = await poolContract.slot0();
    const sqrtPriceX96 = slot0.sqrtPriceX96;

    // Obtener direcciones de tokens para consultar balances reales
    const token0Address = await poolContract.token0();
    const token1Address = await poolContract.token1();

    // Crear contratos para los tokens usando la función reutilizable
    const token0Contract = createBalanceContract(token0Address, provider);
    const token1Contract = createBalanceContract(token1Address, provider);

    // Obtener balances reales de tokens en el pool
    const token0Balance = await token0Contract.balanceOf(poolAddress);
    const token1Balance = await token1Contract.balanceOf(poolAddress);

    // Convertir a números con ajuste de decimales
    const token0BalanceFormatted =
      Number(token0Balance.toString()) / Math.pow(10, token0Decimals);
    const token1BalanceFormatted =
      Number(token1Balance.toString()) / Math.pow(10, token1Decimals);

    // Calcular valor en USDC usando los balances reales
    const token0ValueUSDC = token0BalanceFormatted * priceToken0InUSDC;
    const token1ValueUSDC = token1BalanceFormatted * priceToken1InUSDC;
    const totalLiquidityUSDC = token0ValueUSDC + token1ValueUSDC;

    console.log(`Liquidez real del pool ${poolAddress}:`);
    console.log(
      `Token0 balance: ${token0BalanceFormatted} (${token0ValueUSDC} USDC)`
    );
    console.log(
      `Token1 balance: ${token1BalanceFormatted} (${token1ValueUSDC} USDC)`
    );
    console.log(`Total liquidez: ${totalLiquidityUSDC} USDC`);

    return {
      token0Reserve: token0Balance.toString(),
      token1Reserve: token1Balance.toString(),
      token0ReserveFormatted: token0BalanceFormatted,
      token1ReserveFormatted: token1BalanceFormatted,
      token0ValueUSDC,
      token1ValueUSDC,
      totalLiquidityUSDC,
    };
  } catch (error) {
    console.error(`Error al obtener liquidez para pool ${poolAddress}:`, error);
    // Devolver valores por defecto en caso de error
    return {
      token0Reserve: "0",
      token1Reserve: "0",
      token0ReserveFormatted: 0,
      token1ReserveFormatted: 0,
      token0ValueUSDC: 0,
      token1ValueUSDC: 0,
      totalLiquidityUSDC: 0,
    };
  }
};

// Función para obtener datos completos de un token
const getTokenData = async (
  tokenAddress: string,
  provider: ethers.JsonRpcProvider,
  decimals: number,
  priceInToken1: number = 0,
  priceInUSDC: number = 0
) => {
  const tokenContract = createERC20Contract(tokenAddress, provider);

  try {
    const [name, symbol, totalSupply] = await Promise.all([
      tokenContract.name().catch(() => "Unknown"),
      tokenContract.symbol().catch(() => "???"),
      tokenContract.totalSupply().catch(() => BigInt(0)),
    ]);

    // Calcular total supply formateado
    const totalSupplyFormatted =
      Number(totalSupply.toString()) / Math.pow(10, decimals);

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
      totalSupplyFormatted,
      priceInToken1,
      priceInUSDC,
    };
  } catch (error) {
    console.error(`Error al obtener datos del token ${tokenAddress}:`, error);
    return {
      address: tokenAddress,
      name: "Unknown",
      symbol: "???",
      decimals,
      totalSupply: "0",
      totalSupplyFormatted: 0,
      priceInToken1,
      priceInUSDC,
    };
  }
};

// Función para preparar la respuesta de la API
const prepareApiResponse = (
  poolAddress: string,
  poolVersion: string,
  fee: number | undefined,
  poolData: any,
  token0Data: any,
  token1Data: any,
  marketCap: number,
  token0MarketCap: number,
  marketCapChanges: any,
  volumeData: any,
  liquidityData: any
) => {
  return {
    message: "✅ Pool data fetched successfully",
    poolAddress,
    poolVersion,
    fee,
    // Datos de la pool
    ...poolData,
    // Datos adicionales de token0
    token0Data,
    // Datos adicionales de token1
    token1Data,
    // Datos de mercado
    marketData: {
      marketCap: marketCap || 0,
      marketCapCalculated: token0MarketCap || 0,
      // Cambios porcentuales
      marketCapChanges: {
        "15m":
          marketCapChanges.change15m !== null
            ? Number(marketCapChanges.change15m.toFixed(2))
            : null,
        "1h":
          marketCapChanges.change1h !== null
            ? Number(marketCapChanges.change1h.toFixed(2))
            : null,
        "6h":
          marketCapChanges.change6h !== null
            ? Number(marketCapChanges.change6h.toFixed(2))
            : null,
      },
      priceChanges: {
        "15m":
          marketCapChanges.priceChange15m !== null
            ? Number(marketCapChanges.priceChange15m.toFixed(2))
            : null,
        "1h":
          marketCapChanges.priceChange1h !== null
            ? Number(marketCapChanges.priceChange1h.toFixed(2))
            : null,
        "6h":
          marketCapChanges.priceChange6h !== null
            ? Number(marketCapChanges.priceChange6h.toFixed(2))
            : null,
      },
      volume: {
        "15m": volumeData?.volume15m || {
          volumeInUsdc: 0,
          transactionCount: 0,
        },
        "1h": volumeData?.volume1h || {
          volumeInUsdc: 0,
          transactionCount: 0,
        },
        "6h": volumeData?.volume6h || {
          volumeInUsdc: 0,
          transactionCount: 0,
        },
      },
      // Datos de liquidez
      liquidity: liquidityData || {
        token0Reserve: "0",
        token1Reserve: "0",
        token0ReserveFormatted: 0,
        token1ReserveFormatted: 0,
        token0ValueUSDC: 0,
        token1ValueUSDC: 0,
        totalLiquidityUSDC: 0,
      },
    },
    // Timestamp de la respuesta
    timestamp: Math.floor(Date.now() / 1000),
    timestampFormatted: new Date().toISOString(),
  };
};

// Función para obtener todos los datos necesarios de una pool
const getPoolCompleteData = async (
  poolAddress: string
): Promise<{
  poolVersion: string;
  fee?: number;
  poolData: any;
  token0Data: any;
  token1Data: any;
  marketCap: number;
  token0MarketCap: number;
  marketCapChanges: PercentageChanges;
  volumeData: any;
  liquidityData: any;
  error?: string;
}> => {
  try {
    const provider = createProvider();

    // Determinar la versión de la pool y obtener el fee
    const { version: poolVersion, fee } = await determinePoolVersion(
      poolAddress,
      provider
    );
    console.log(
      `Pool ${poolAddress} identificada como Uniswap V3${
        fee ? ` con fee ${fee}` : ""
      }`
    );

    // Obtener información de la pool
    const pairToken = await checkPairToken(poolAddress);
    const poolData = await getPrice(poolAddress);

    if ("error" in poolData) {
      return {
        error: poolData.error,
        poolVersion,
        fee,
        poolData: {},
        token0Data: {},
        token1Data: {},
        marketCap: 0,
        token0MarketCap: 0,
        marketCapChanges: {
          change15m: null,
          change1h: null,
          change6h: null,
          priceChange15m: null,
          priceChange1h: null,
          priceChange6h: null,
        },
        volumeData: {},
        liquidityData: {},
      };
    }

    // Obtener precios en USDC usando la función unificada
    const priceToken1InUSDC = await getTokenPriceInUSDC(pairToken.token1Symbol);

    // Calcular precio del token0 en USDC
    const priceToken0InUSDC = priceToken1InUSDC * poolData.price0to1;
    console.log("priceToken0InUSDC", priceToken0InUSDC);

    // Obtener datos completos de los tokens
    const token0Data = await getTokenData(
      poolData.token0,
      provider,
      poolData.decimals0,
      poolData.price0to1,
      priceToken0InUSDC
    );

    const token1Data = await getTokenData(
      poolData.token1,
      provider,
      poolData.decimals1,
      0, // No necesitamos price in token para token1
      priceToken1InUSDC
    );

    // Calcular market cap
    const marketCap = await getMarketCap(priceToken0InUSDC);
    const token0MarketCap = token0Data.totalSupplyFormatted * priceToken0InUSDC;

    // Obtener volúmenes para todos los períodos de una vez
    const volumeData = await getMultiPeriodVolume(
      poolAddress,
      priceToken1InUSDC,
      poolData.price0to1,
      poolData.decimals0,
      poolData.decimals1
    );

    // Obtener liquidez de la pool
    const liquidityData = await getPoolLiquidity(
      poolAddress,
      provider,
      poolData.decimals0,
      poolData.decimals1,
      priceToken0InUSDC,
      priceToken1InUSDC
    );

    // Calcular cambios porcentuales en market cap y precio
    const marketCapChanges = calculateMarketCapChanges(
      poolAddress,
      token0MarketCap,
      priceToken0InUSDC,
      volumeData?.volume15m?.volumeInUsdc || 0
    );

    return {
      poolVersion,
      fee,
      poolData,
      token0Data,
      token1Data,
      marketCap,
      token0MarketCap,
      marketCapChanges,
      volumeData,
      liquidityData,
    };
  } catch (error) {
    console.error("Error obteniendo datos completos de la pool:", error);
    return {
      error: "Error fetching pool data",
      poolVersion: "v3",
      poolData: {},
      token0Data: {},
      token1Data: {},
      marketCap: 0,
      token0MarketCap: 0,
      marketCapChanges: {
        change15m: null,
        change1h: null,
        change6h: null,
        priceChange15m: null,
        priceChange1h: null,
        priceChange6h: null,
      },
      volumeData: {},
      liquidityData: {},
    };
  }
};

export async function GET(request: Request) {
  console.info("[GET][/api/data-onchain]");
  const { searchParams } = new URL(request.url);
  const poolAddress = searchParams.get("poolAddress");

  if (!poolAddress) {
    return NextResponse.json(
      { error: "Pool address is required" },
      { status: 400 }
    );
  }

  try {
    // Obtener todos los datos de la pool
    const poolCompleteData = await getPoolCompleteData(poolAddress);

    // Si hay un error, devolver el error
    if (poolCompleteData.error) {
      return NextResponse.json(
        { error: poolCompleteData.error },
        { status: 500 }
      );
    }

    // Preparar y devolver la respuesta
    const response = prepareApiResponse(
      poolAddress,
      poolCompleteData.poolVersion,
      poolCompleteData.fee,
      poolCompleteData.poolData,
      poolCompleteData.token0Data,
      poolCompleteData.token1Data,
      poolCompleteData.marketCap,
      poolCompleteData.token0MarketCap,
      poolCompleteData.marketCapChanges,
      poolCompleteData.volumeData,
      poolCompleteData.liquidityData
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching pool data:", error);
    return NextResponse.json(
      { error: "Error fetching pool data" },
      { status: 500 }
    );
  }
}
