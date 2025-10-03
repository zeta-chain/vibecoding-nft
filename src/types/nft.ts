// NFT Transfer Record for tracking cross-chain movements
export interface NFTTransferRecord {
  fromChainId: string;
  fromChainName: string;
  toChainId: string;
  toChainName: string;
  transferTxHash: string;
  transferTimestamp: number;
  transferBlockNumber: number;
}

// Main NFT data structure for local storage
export interface NFTData {
  // Core NFT identification
  tokenId: string;
  tokenURI: string;
  contractAddress: string;
  
  // Chain information
  chainId: string;
  chainName: string;
  currentChain: string; // Current chain where NFT resides
  
  // Minting information
  mintTxHash: string;
  mintTimestamp: number;
  mintBlockNumber: number;
  ownerAddress: string;
  
  // Cross-chain transfer tracking
  transferHistory: NFTTransferRecord[];
  isTransferred: boolean;
  
  // Metadata for UI/display
  name?: string; // NFT name (if available from metadata)
  description?: string; // NFT description (if available from metadata)
  image?: string; // NFT image URL (if available from metadata)
  
  // Additional metadata
  createdAt: number; // When this record was created in local storage
  lastUpdated: number; // When this record was last modified
}

// Local storage key structure
export const NFT_STORAGE_KEYS = {
  NFT_COLLECTION: 'nft_collection',
  NFT_COUNTER: 'nft_counter',
} as const;

// Helper type for creating new NFT records
export interface CreateNFTDataParams {
  tokenId: string;
  tokenURI: string;
  contractAddress: string;
  chainId: string;
  chainName: string;
  mintTxHash: string;
  mintBlockNumber: number;
  ownerAddress: string;
}
