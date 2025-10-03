import { ethers } from 'ethers';

import { ZRC20_TOKEN_ADDRESSES } from '../constants/contracts';
import { createNFTContract } from '../contracts/EVMUniversalNFT';
import { updateNFTTransfer } from './nftStorage';

interface TransferNFTParams {
  tokenId: string;
  contractAddress: string; // Original contract address (for storage updates)
  currentChainContractAddress: string; // Contract address on current chain
  destinationChain: string;
  receiverAddress: string;
  signer: ethers.AbstractSigner;
  fromChainName: string;
}

export const transferNFT = async ({
  tokenId,
  contractAddress,
  currentChainContractAddress,
  destinationChain,
  receiverAddress,
  signer,
  fromChainName,
}: TransferNFTParams): Promise<ethers.ContractTransactionResponse> => {
  try {
    // Get the ZRC20 token address for the destination chain
    const destinationAddress = getZRC20Address(destinationChain);
    if (!destinationAddress) {
      throw new Error(`ZRC20 address not found for destination chain: ${destinationChain}`);
    }

    // Create the NFT contract instance using the current chain's contract address
    const nftContract = createNFTContract(currentChainContractAddress, signer);

    // Step 1: Approve the contract to transfer the NFT
    console.log('Approving NFT for transfer...');
    const approveTx = await nftContract.approve(currentChainContractAddress, tokenId, {
      gasLimit: 1000000,
    });
    await approveTx.wait();
    console.log('Approval transaction confirmed:', approveTx.hash);

    // Step 2: Call transferCrossChain function
    console.log('Initiating cross-chain transfer...', {
      tokenId,
      receiverAddress,
      destinationAddress,
    });
    const result = await nftContract.transferCrossChain(
      tokenId,
      receiverAddress,
      destinationAddress,
      {
        gasLimit: 1000000,
        value: ethers.parseEther('0.01'), // Start with 0 gas amount, can be adjusted
      }
    ) as ethers.ContractTransactionResponse;

    // Wait for the transaction to be mined
    const receipt = await result.wait();
    
    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }

    console.log('Transfer transaction confirmed:', result.hash);

    // Update NFT storage with transfer information
    try {
      updateNFTTransfer(tokenId, contractAddress, {
        fromChainId: await signer.provider?.getNetwork().then(network => network.chainId.toString()) || '0',
        fromChainName,
        toChainId: getChainId(destinationChain),
        toChainName: destinationChain,
        transferTxHash: result.hash,
        transferBlockNumber: receipt.blockNumber,
      });
    } catch (storageError) {
      console.error('Failed to update NFT transfer in storage:', storageError);
      // Don't throw here - the transfer was successful, storage is secondary
    }

    return result;
  } catch (error) {
    console.error('NFT transfer failed:', error);
    throw error;
  }
};

const getZRC20Address = (chainName: string): string | null => {
  switch (chainName) {
    case 'ZetaChain':
      return ZRC20_TOKEN_ADDRESSES.ZETACHAIN;
    case 'Ethereum Sepolia':
      return ZRC20_TOKEN_ADDRESSES.SEPOLIA;
    case 'Base Sepolia':
      return ZRC20_TOKEN_ADDRESSES.BASE_SEPOLIA;
    default:
      return null;
  }
};

const getChainId = (chainName: string): string => {
  switch (chainName) {
    case 'ZetaChain':
      return '7001'; // ZetaChain testnet chain ID
    case 'Ethereum Sepolia':
      return '11155111';
    case 'Base Sepolia':
      return '84532';
    default:
      return '0';
  }
};
