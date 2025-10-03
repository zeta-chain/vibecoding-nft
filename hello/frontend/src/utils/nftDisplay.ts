import type { NFTData } from '../types/nft';
import { getNFTCollection, getNFTsByOwner, getNFTStorageStats } from './nftStorage';

// Helper function to format NFT data for display
export const formatNFTForDisplay = (nft: NFTData) => {
  return {
    id: nft.tokenId,
    name: nft.name || `NFT #${nft.tokenId}`,
    description: nft.description || 'No description available',
    image: nft.image || '/placeholder-nft.png', // Fallback image
    uri: nft.tokenURI,
    chain: nft.chainName,
    contractAddress: nft.contractAddress,
    mintDate: new Date(nft.mintTimestamp).toLocaleDateString(),
    isTransferred: nft.isTransferred,
    transferCount: nft.transferHistory.length,
    currentChain: nft.currentChain,
  };
};

// Get all NFTs formatted for display
export const getAllNFTsForDisplay = () => {
  try {
    const collection = getNFTCollection();
    return Object.values(collection).map(formatNFTForDisplay);
  } catch (error) {
    console.error('Failed to get NFTs for display:', error);
    return [];
  }
};

// Get NFTs by owner formatted for display
export const getNFTsByOwnerForDisplay = (ownerAddress: string) => {
  try {
    const nfts = getNFTsByOwner(ownerAddress);
    return nfts.map(formatNFTForDisplay);
  } catch (error) {
    console.error('Failed to get NFTs by owner for display:', error);
    return [];
  }
};

// Get storage statistics formatted for display
export const getStorageStatsForDisplay = () => {
  try {
    const stats = getNFTStorageStats();
    return {
      totalNFTs: stats.totalNFTs,
      totalTransferred: stats.totalTransferred,
      chainsWithNFTs: stats.chainsWithNFTs.join(', '),
      totalTransfers: stats.totalTransfers,
      averageTransfersPerNFT: stats.totalNFTs > 0 ? (stats.totalTransfers / stats.totalNFTs).toFixed(2) : '0',
    };
  } catch (error) {
    console.error('Failed to get storage stats for display:', error);
    return {
      totalNFTs: 0,
      totalTransferred: 0,
      chainsWithNFTs: 'None',
      totalTransfers: 0,
      averageTransfersPerNFT: '0',
    };
  }
};

// Helper to check if an NFT exists in storage
export const isNFTInStorage = (tokenId: string, contractAddress: string): boolean => {
  try {
    const collection = getNFTCollection();
    const nftKey = `${contractAddress.toLowerCase()}_${tokenId}`;
    return nftKey in collection;
  } catch (error) {
    console.error('Failed to check if NFT is in storage:', error);
    return false;
  }
};

// Helper to get NFT metadata from URI (for future use)
export const fetchNFTMetadata = async (uri: string): Promise<{
  name?: string;
  description?: string;
  image?: string;
} | null> => {
  try {
    // Handle IPFS URLs
    let fetchUrl = uri;
    if (uri.startsWith('ipfs://')) {
      fetchUrl = `https://ipfs.io/ipfs/${uri.slice(7)}`;
    } else if (uri.startsWith('/ipfs/')) {
      fetchUrl = `https://ipfs.io${uri}`;
    }
    
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const metadata = await response.json();
    return {
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
    };
  } catch (error) {
    console.error('Failed to fetch NFT metadata:', error);
    return null;
  }
};
