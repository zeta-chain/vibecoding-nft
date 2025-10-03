import type { CreateNFTDataParams, NFTData } from '../types/nft';
import { NFT_STORAGE_KEYS } from '../types/nft';

// Error handling for local storage operations
class NFTStorageError extends Error {
  public operation: string;
  
  constructor(message: string, operation: string) {
    super(message);
    this.name = 'NFTStorageError';
    this.operation = operation;
  }
}

// Generate a unique key for an NFT based on tokenId and contractAddress
const generateNFTKey = (tokenId: string, contractAddress: string): string => {
  return `${contractAddress.toLowerCase()}_${tokenId}`;
};

// Create a new NFT data object from minting parameters
export const createNFTData = (params: CreateNFTDataParams): NFTData => {
  const now = Date.now();
  
  return {
    // Core NFT identification
    tokenId: params.tokenId,
    tokenURI: params.tokenURI,
    contractAddress: params.contractAddress,
    
    // Chain information
    chainId: params.chainId,
    chainName: params.chainName,
    currentChain: params.chainName, // Initially on the same chain where minted
    
    // Minting information
    mintTxHash: params.mintTxHash,
    mintTimestamp: now,
    mintBlockNumber: params.mintBlockNumber,
    ownerAddress: params.ownerAddress,
    
    // Cross-chain transfer tracking
    transferHistory: [],
    isTransferred: false,
    
    // Metadata (will be populated later if needed)
    name: undefined,
    description: undefined,
    image: undefined,
    
    // Additional metadata
    createdAt: now,
    lastUpdated: now,
  };
};

// Save NFT data to local storage
export const saveNFTToStorage = (nftData: NFTData): void => {
  try {
    const existingData = getNFTCollection();
    const nftKey = generateNFTKey(nftData.tokenId, nftData.contractAddress);
    
    // Update the NFT data with current timestamp
    const updatedNFTData = {
      ...nftData,
      lastUpdated: Date.now(),
    };
    
    existingData[nftKey] = updatedNFTData;
    
    localStorage.setItem(NFT_STORAGE_KEYS.NFT_COLLECTION, JSON.stringify(existingData));
    
    // Increment counter
    const currentCounter = getNFTCounter();
    localStorage.setItem(NFT_STORAGE_KEYS.NFT_COUNTER, (currentCounter + 1).toString());
    
  } catch (error) {
    throw new NFTStorageError(
      `Failed to save NFT to storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'save'
    );
  }
};

// Retrieve all NFTs from local storage
export const getNFTCollection = (): Record<string, NFTData> => {
  try {
    const data = localStorage.getItem(NFT_STORAGE_KEYS.NFT_COLLECTION);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    throw new NFTStorageError(
      `Failed to retrieve NFT collection: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'retrieve'
    );
  }
};

// Get NFT counter
export const getNFTCounter = (): number => {
  try {
    const counter = localStorage.getItem(NFT_STORAGE_KEYS.NFT_COUNTER);
    return counter ? parseInt(counter, 10) : 0;
  } catch (error) {
    throw new NFTStorageError(
      `Failed to retrieve NFT counter: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'counter'
    );
  }
};

// Get a specific NFT by tokenId and contractAddress
export const getNFTByKey = (tokenId: string, contractAddress: string): NFTData | null => {
  try {
    const collection = getNFTCollection();
    const nftKey = generateNFTKey(tokenId, contractAddress);
    return collection[nftKey] || null;
  } catch (error) {
    throw new NFTStorageError(
      `Failed to retrieve NFT: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'getByKey'
    );
  }
};

// Get all NFTs for a specific chain
export const getNFTsByChain = (chainId: string): NFTData[] => {
  try {
    const collection = getNFTCollection();
    return Object.values(collection).filter(nft => nft.chainId === chainId);
  } catch (error) {
    throw new NFTStorageError(
      `Failed to retrieve NFTs by chain: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'getByChain'
    );
  }
};

// Get all NFTs owned by a specific address
export const getNFTsByOwner = (ownerAddress: string): NFTData[] => {
  try {
    const collection = getNFTCollection();
    return Object.values(collection).filter(nft => 
      nft.ownerAddress.toLowerCase() === ownerAddress.toLowerCase()
    );
  } catch (error) {
    throw new NFTStorageError(
      `Failed to retrieve NFTs by owner: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'getByOwner'
    );
  }
};

// Update NFT transfer history (for future cross-chain transfers)
export const updateNFTTransfer = (
  tokenId: string,
  contractAddress: string,
  transferRecord: {
    fromChainId: string;
    fromChainName: string;
    toChainId: string;
    toChainName: string;
    transferTxHash: string;
    transferBlockNumber: number;
  }
): void => {
  try {
    const nftKey = generateNFTKey(tokenId, contractAddress);
    const collection = getNFTCollection();
    const nft = collection[nftKey];
    
    if (!nft) {
      throw new Error(`NFT not found: ${nftKey}`);
    }
    
    // Add transfer record
    nft.transferHistory.push({
      ...transferRecord,
      transferTimestamp: Date.now(),
    });
    
    // Update current chain and transfer status
    nft.currentChain = transferRecord.toChainName;
    nft.isTransferred = true;
    nft.lastUpdated = Date.now();
    
    // Save back to storage
    collection[nftKey] = nft;
    localStorage.setItem(NFT_STORAGE_KEYS.NFT_COLLECTION, JSON.stringify(collection));
    
  } catch (error) {
    throw new NFTStorageError(
      `Failed to update NFT transfer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'updateTransfer'
    );
  }
};

// Clear all NFT data (useful for testing or reset)
export const clearNFTStorage = (): void => {
  try {
    localStorage.removeItem(NFT_STORAGE_KEYS.NFT_COLLECTION);
    localStorage.removeItem(NFT_STORAGE_KEYS.NFT_COUNTER);
  } catch (error) {
    throw new NFTStorageError(
      `Failed to clear NFT storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'clear'
    );
  }
};

// Get storage statistics
export const getNFTStorageStats = (): {
  totalNFTs: number;
  totalTransferred: number;
  chainsWithNFTs: string[];
  totalTransfers: number;
} => {
  try {
    const collection = getNFTCollection();
    const nfts = Object.values(collection);
    
    const totalNFTs = nfts.length;
    const totalTransferred = nfts.filter(nft => nft.isTransferred).length;
    const chainsWithNFTs = [...new Set(nfts.map(nft => nft.chainName))];
    const totalTransfers = nfts.reduce((sum, nft) => sum + nft.transferHistory.length, 0);
    
    return {
      totalNFTs,
      totalTransferred,
      chainsWithNFTs,
      totalTransfers,
    };
  } catch (error) {
    throw new NFTStorageError(
      `Failed to get storage stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'stats'
    );
  }
};
