import './NFTList.css';

import { useEffect, useState } from 'react';

import { getAllNFTsForDisplay } from '../utils/nftDisplay';

interface NFTDisplayData {
  id: string;
  name: string;
  description: string;
  image: string;
  uri: string;
  chain: string;
  contractAddress: string;
  mintDate: string;
  isTransferred: boolean;
  transferCount: number;
  currentChain: string;
}


export function NFTList() {
  const [nfts, setNfts] = useState<NFTDisplayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNFTs = () => {
      try {
        const nftData = getAllNFTsForDisplay();
        setNfts(nftData);
      } catch (error) {
        console.error('Failed to load NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
    
    // Refresh data every 10 seconds in case of updates
    const interval = setInterval(loadNFTs, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="nft-list-container">
        <h2>My NFTs</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="nft-list-container">
        <p>No NFTs found. Mint your first NFT to see it here!</p>
      </div>
    );
  }

  return (
    <div className="nft-list-container">
      <div className="nft-grid">
        {nfts.map((nft) => (
          <div key={`${nft.contractAddress}_${nft.id}`} className="nft-card">
            <div className="nft-info">
              <h3 className="nft-name">{nft.name}</h3>
              <p className="nft-description">{nft.description}</p>
              <div className="nft-details">
                <p><strong>Token ID:</strong> {nft.id}</p>
                <p><strong>Chain:</strong> {nft.chain}</p>
                <p><strong>Current Chain:</strong> {nft.currentChain}</p>
                <p><strong>Minted:</strong> {nft.mintDate}</p>
                {nft.isTransferred && (
                  <p><strong>Transfers:</strong> {nft.transferCount}</p>
                )}
                <p><strong>Contract:</strong> {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}</p>
              </div>
              <div className="nft-actions">
                <a 
                  href={nft.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="nft-link"
                >
                  View Metadata
                </a>
                {/* Future: Add transfer button here */}
                <button 
                  className="nft-transfer-btn" 
                  disabled
                  title="Cross-chain transfer coming soon"
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
