import './NFTList.css';

import type { PrimaryWallet } from '@zetachain/wallet';
import { useEffect, useState } from 'react';

import { SUPPORTED_CHAINS } from '../constants/chains';
import { NFT_CONTRACT_ADDRESSES } from '../constants/contracts';
import type { EIP6963ProviderDetail } from '../types/wallet';
import { getSignerAndProvider } from '../utils/ethersHelpers';
import { getAllNFTsForDisplay } from '../utils/nftDisplay';
import { transferNFT } from '../utils/nftTransfer';

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

interface NFTListProps {
  selectedProvider: EIP6963ProviderDetail | null;
  primaryWallet: PrimaryWallet | null;
}

export function NFTList({ selectedProvider, primaryWallet }: NFTListProps) {
  const [nfts, setNfts] = useState<NFTDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestinations, setSelectedDestinations] = useState<
    Record<string, string>
  >({});
  const [transferring, setTransferring] = useState<Record<string, boolean>>({});

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

  const handleDestinationChange = (nftId: string, destination: string) => {
    setSelectedDestinations((prev) => ({
      ...prev,
      [nftId]: destination,
    }));
  };

  const handleTransfer = async (nft: NFTDisplayData) => {
    const nftKey = `${nft.contractAddress}_${nft.id}`;
    const destination = selectedDestinations[nftKey];

    if (!destination) {
      alert('Please select a destination chain');
      return;
    }

    setTransferring((prev) => ({ ...prev, [nftKey]: true }));

    try {
      console.log(
        `Transferring NFT ${nft.id} from ${nft.currentChain} to ${destination}`
      );

      // Get signer and provider
      const signerAndProvider = await getSignerAndProvider({
        selectedProvider,
        primaryWallet,
      });

      if (!signerAndProvider) {
        throw new Error('Failed to get wallet connection');
      }

      const { signer } = signerAndProvider;
      const userAddress = await signer.getAddress();

      // Confirm transfer
      const confirmed = confirm(
        `Transfer NFT #${nft.id} from ${nft.currentChain} to ${destination}?\n\n` +
          `This will initiate a cross-chain transfer. The NFT will be moved to the destination chain.\n\n` +
          `You will need to approve two transactions:\n` +
          `1. Approve the contract to transfer your NFT\n` +
          `2. Execute the cross-chain transfer`
      );

      if (confirmed) {
        // Get the contract address for the current chain
        const currentChainContractAddress = getNFTContractAddress(
          nft.currentChain
        );
        if (!currentChainContractAddress) {
          throw new Error(
            `Contract address not found for current chain: ${nft.currentChain}`
          );
        }

        // Execute the actual transfer
        const result = await transferNFT({
          tokenId: nft.id,
          contractAddress: nft.contractAddress, // Original contract address for storage
          currentChainContractAddress: currentChainContractAddress, // Current chain contract for approve/transfer
          destinationChain: destination,
          receiverAddress: userAddress,
          signer: signer,
          fromChainName: nft.currentChain,
        });

        alert(
          `Transfer successful! NFT #${nft.id} is being transferred to ${destination}.\n\nTransaction hash: ${result.hash}`
        );

        // Refresh the NFT list to show updated state
        const nftData = getAllNFTsForDisplay();
        setNfts(nftData);
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      alert(
        `Transfer failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setTransferring((prev) => ({ ...prev, [nftKey]: false }));
    }
  };

  const getAvailableDestinations = (currentChain: string) => {
    return SUPPORTED_CHAINS.filter((chain) => chain.name !== currentChain);
  };

  const getNFTContractAddress = (chainName: string): string | null => {
    switch (chainName) {
      case 'ZetaChain':
        return NFT_CONTRACT_ADDRESSES.ZETACHAIN;
      case 'Ethereum Sepolia':
        return NFT_CONTRACT_ADDRESSES.SEPOLIA;
      case 'Base Sepolia':
        return NFT_CONTRACT_ADDRESSES.BASE_SEPOLIA;
      default:
        return null;
    }
  };

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
                <p>
                  <strong>Token ID:</strong> {nft.id}
                </p>
                <p>
                  <strong>Chain:</strong> {nft.chain}
                </p>
                <p>
                  <strong>Current Chain:</strong> {nft.currentChain}
                </p>
                <p>
                  <strong>Minted:</strong> {nft.mintDate}
                </p>
                {nft.isTransferred && (
                  <p>
                    <strong>Transfers:</strong> {nft.transferCount}
                  </p>
                )}
                <p>
                  <strong>Contract:</strong> {nft.contractAddress.slice(0, 6)}
                  ...{nft.contractAddress.slice(-4)}
                </p>
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
                <div className="nft-transfer-section">
                  <select
                    className="nft-destination-select"
                    value={
                      selectedDestinations[
                        `${nft.contractAddress}_${nft.id}`
                      ] || ''
                    }
                    onChange={(e) =>
                      handleDestinationChange(
                        `${nft.contractAddress}_${nft.id}`,
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select destination</option>
                    {getAvailableDestinations(nft.currentChain).map((chain) => (
                      <option key={chain.name} value={chain.name}>
                        {chain.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="nft-transfer-btn"
                    onClick={() => handleTransfer(nft)}
                    disabled={
                      transferring[`${nft.contractAddress}_${nft.id}`] ||
                      !selectedDestinations[`${nft.contractAddress}_${nft.id}`]
                    }
                  >
                    {transferring[`${nft.contractAddress}_${nft.id}`]
                      ? 'Transferring...'
                      : 'Transfer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
