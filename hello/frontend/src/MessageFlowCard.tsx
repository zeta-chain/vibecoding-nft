import './MessageFlowCard.css';

import { type PrimaryWallet } from '@zetachain/wallet';
import { ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';

import { Button } from './components/Button';
import { IconApprove, IconEnvelope, IconSendTitle } from './components/icons';
import { ConfirmedContent } from './ConfirmedContent';
import type { SupportedChain } from './constants/chains';
import { NFT_CONTRACT_ADDRESSES } from './constants/contracts';
import { createNFTContract } from './contracts/EVMUniversalNFT';
import type { EIP6963ProviderDetail } from './types/wallet';
import { getSignerAndProvider } from './utils/ethersHelpers';
import { formatNumberWithLocale } from './utils/formatNumber';
import { createNFTData, saveNFTToStorage } from './utils/nftStorage';

interface MessageFlowCardProps {
  selectedProvider: EIP6963ProviderDetail | null;
  supportedChain: SupportedChain | undefined;
  primaryWallet?: PrimaryWallet | null; // Dynamic wallet from context
}

export function MessageFlowCard({
  selectedProvider,
  supportedChain,
  primaryWallet = null,
}: MessageFlowCardProps) {

  const MAX_STRING_LENGTH = 2000;
  const [isUserSigningTx, setIsUserSigningTx] = useState(false);
  const [isTxReceiptLoading, setIsTxReceiptLoading] = useState(false);
  const [stringValue, setStringValue] = useState('');
  const [connectedChainTxHash, setConnectedChainTxHash] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getStringByteLength = (string: string) => {
    return new TextEncoder().encode(string).length;
  };

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    
    try {
      // Check for HTTPS URLs
      if (url.startsWith('https://')) {
        new URL(url);
        return true;
      }
      
      // Check for IPFS URLs (ipfs:// or /ipfs/)
      if (url.startsWith('ipfs://') || url.startsWith('/ipfs/')) {
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  };

  const getNFTContractAddress = (chain: SupportedChain | undefined): string | null => {
    if (!chain) return null;
    
    switch (chain.name) {
      case 'ZetaChain':
        return NFT_CONTRACT_ADDRESSES.ZETACHAIN;
      case 'Sepolia':
        return NFT_CONTRACT_ADDRESSES.SEPOLIA;
      case 'Base Sepolia':
        return NFT_CONTRACT_ADDRESSES.BASE_SEPOLIA;
      default:
        return null;
    }
  };

  const handleClick = async () => {
    try {
      const signerAndProvider = await getSignerAndProvider({
        selectedProvider,
        primaryWallet,
      });

      if (!signerAndProvider) {
        throw new Error('Failed to get signer');
      }

      const { signer } = signerAndProvider;

      // Get the NFT contract address for the selected chain
      const nftContractAddress = getNFTContractAddress(supportedChain);
      if (!nftContractAddress) {
        throw new Error('NFT contract not available for selected chain');
      }

      // Get the user's address
      const userAddress = await signer.getAddress();
      
      console.debug('Minting NFT with URI:', stringValue);
      console.debug('To address:', userAddress);
      console.debug('Contract address:', nftContractAddress);

      setIsUserSigningTx(true);

      // Create the NFT contract instance and call safeMint
      const nftContract = createNFTContract(nftContractAddress, signer);
      const result = await nftContract.safeMint(userAddress, stringValue) as ethers.ContractTransactionResponse;

      setIsTxReceiptLoading(true);

      // Wait for the transaction to be mined
      const receipt = await result.wait();
      
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      // Get the tokenId from the Transfer event in the receipt
      let tokenId: string | null = null;
      
      // Look for Transfer event in the receipt logs
      const transferEventTopic = ethers.id('Transfer(address,address,uint256)');
      const receiptLogs = receipt.logs || [];

      console.debug('Receipt logs:', receiptLogs);

      const transferLog = receiptLogs.find(log => 
        log.topics[0] === transferEventTopic && 
        log.address.toLowerCase() === nftContractAddress.toLowerCase()
      );
      
      if (transferLog && transferLog.topics[3]) {
        // The tokenId is in the third topic (index 3)
        // Use BigInt to handle large numbers safely
        try {
          const tokenIdBigInt = BigInt(transferLog.topics[3]);
          tokenId = tokenIdBigInt.toString();
        } catch (error) {
          console.warn('Could not convert tokenId to BigInt:', error);
          // Fallback: use the raw hex value
          tokenId = transferLog.topics[3];
        }
      }

      if (!tokenId) {
        console.warn('Could not extract tokenId from transaction receipt');
        // We'll still save the transaction hash for reference
        tokenId = `unknown_${receipt.hash.slice(-8)}`;
      }

      // Save NFT data to local storage
      try {
        const nftData = createNFTData({
          tokenId,
          tokenURI: stringValue,
          contractAddress: nftContractAddress,
          chainId: supportedChain?.chainId.toString() || '',
          chainName: supportedChain?.name || '',
          mintTxHash: receipt.hash,
          mintBlockNumber: receipt.blockNumber,
          ownerAddress: userAddress,
        });
        
        saveNFTToStorage(nftData);
        console.log('NFT data saved to local storage:', nftData);
      } catch (storageError) {
        console.error('Failed to save NFT to storage:', storageError);
        // Don't throw here - the mint was successful, storage is secondary
      }

      setConnectedChainTxHash(receipt.hash);
    } catch (error) {
      console.error('Error minting NFT:', error);
    } finally {
      setIsUserSigningTx(false);
      setIsTxReceiptLoading(false);
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight to fit content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [stringValue]);

  if (connectedChainTxHash || isTxReceiptLoading) {
    return (
      <ConfirmedContent
        supportedChain={supportedChain}
        connectedChainTxHash={connectedChainTxHash}
        stringValue={stringValue}
        handleSendAnotherMessage={() => {
          setConnectedChainTxHash('');
          setStringValue('');
        }}
      />
    );
  }

  if (isUserSigningTx) {
    return (
      <div className="approve-container">
        <IconApprove />
        <div className="approve-content">
          <h1 className="approve-title">Approve from Wallet</h1>
          <p className="approve-description">
            Awaiting approval via your wallet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-flow-container">
      <div className="message-flow-title">
        <IconSendTitle />
        <span className="message-flow-title-text">NFT Token URI</span>
      </div>
      <div className="message-input-container">
        <textarea
          ref={textareaRef}
          name="message-input"
          className="message-input"
          placeholder="Enter a valid URL (https:// or ipfs://)"
          value={stringValue}
          rows={1}
          onChange={(e) => {
            if (getStringByteLength(e.target.value) <= MAX_STRING_LENGTH) {
              setStringValue(e.target.value);
            }
          }}
        />
      </div>
      <div className="message-separator" />
      {!supportedChain && (
        <span className="message-unsupported-network">
          Select a network to mint an NFT
        </span>
      )}
      <div className="message-input-footer">
        <div className="message-input-length-container">
          <div className="message-input-length-container-inner">
            <span className="message-input-length">
              {formatNumberWithLocale(getStringByteLength(stringValue))}{' '}
            </span>
            <span className="message-input-length-max">
              / {formatNumberWithLocale(MAX_STRING_LENGTH)}
            </span>
          </div>
          <span className="message-input-length-characters">Characters</span>
        </div>
        <div>
          <Button
            type="button"
            onClick={handleClick}
            disabled={
              !stringValue.length ||
              !supportedChain ||
              getStringByteLength(stringValue) > MAX_STRING_LENGTH ||
              !isValidUrl(stringValue)
            }
            icon={<IconEnvelope />}
          >
            Mint NFT
          </Button>
        </div>
      </div>
    </div>
  );
}
