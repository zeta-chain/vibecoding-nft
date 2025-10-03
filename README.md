# Cross-Chain NFT Transfer Application

A React-based web application for minting and transferring NFTs across multiple blockchain networks using ZetaChain's cross-chain infrastructure.

## Features

- **Multi-Chain NFT Minting**: Mint NFTs on Ethereum Sepolia and Base Sepolia
- **Cross-Chain Transfers**: Seamlessly transfer NFTs between supported chains
- **Wallet Integration**: Support for multiple wallet providers via EIP-6963 and Dynamic wallet
- **Local Storage**: NFT metadata and transfer history stored locally
- **Real-time Updates**: Live tracking of transfer status and blockchain confirmations

## Supported Networks

- **Ethereum Sepolia** (Chain ID: 11155111)
- **Base Sepolia** (Chain ID: 84532)

## Getting Started

### ⚠️ Important: Deploy Your Own Contracts

**This application requires you to deploy your own Universal NFT contracts.** The contract addresses in the code are examples only and implement owner-only minting restrictions.

**You MUST follow the [ZetaChain Universal NFT tutorial](https://www.zetachain.com/docs/developers/standards/nft) to:**

1. Deploy Universal NFT contracts on Ethereum Sepolia and Base Sepolia
2. Connect the contracts for cross-chain communication
3. Update the contract addresses in `src/constants/contracts.ts`

Without deploying your own contracts, you won't be able to mint or transfer NFTs using this example.

### Prerequisites

- Node.js 18+ and yarn
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- Testnet ETH on Ethereum Sepolia and Base Sepolia for gas fees

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd vibecoding-nft-fe
```

2. Install dependencies:

```bash
yarn install
```

3. Start the development server:

```bash
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Minting NFTs

1. Connect your wallet to the application
2. Select your desired network (Ethereum Sepolia or Base Sepolia)
3. Click "Mint NFT" to create a new NFT with metadata
4. Confirm the transaction in your wallet
5. Your NFT will appear in the NFT list once minted

### Transferring NFTs

1. View your minted NFTs in the main interface
2. Select a destination chain from the dropdown
3. Click "Transfer" to initiate a cross-chain transfer
4. Approve the transaction to allow the bridge contract to transfer your NFT
5. Confirm the cross-chain transfer transaction
6. Monitor the transfer progress in the console logs

## Technical Architecture

### Smart Contracts

- **EVMUniversalNFT**: Deployed on Ethereum Sepolia and Base Sepolia for NFT minting and cross-chain transfers
- **ZRC20 Tokens**: Bridge tokens that facilitate cross-chain transfers via ZetaChain infrastructure

### Key Components

- **Wallet Integration**: Dynamic wallet and EIP-6963 provider support
- **Cross-Chain Logic**: ZetaChain bridge integration for seamless transfers
- **Local Storage**: NFT metadata and transfer history persistence
- **Error Handling**: Comprehensive error handling and user feedback

## Development

### Project Structure

```
src/
├── components/        # React components
├── constants/         # Contract addresses and chain configurations
├── contracts/         # Smart contract ABIs and utilities
├── context/           # React context providers
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── main.tsx           # Application entry point
```

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

### Environment Setup

The application uses testnet networks by default. To configure for mainnet:

1. Update contract addresses in `src/constants/contracts.ts`
2. Update chain configurations in `src/constants/chains.ts`
3. Ensure you have the correct network configurations in your wallet

## Troubleshooting

### Common Issues

**"Transaction execution reverted"**

- Ensure you have sufficient gas fees
- Verify you own the NFT you're trying to transfer
- Check that the destination chain is supported

**"Failed to get wallet connection"**

- Make sure your wallet is connected and unlocked
- Try refreshing the page and reconnecting your wallet
- Check browser console for detailed error messages

**"ZRC20 address not found"**

- Verify the destination chain is supported
- Check that contract addresses are correctly configured

### Getting Help

- Check the browser console for detailed error logs
- Verify your wallet has sufficient testnet tokens
- Ensure you're connected to the correct network

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Acknowledgments

- Cross-chain functionality enabled by [ZetaChain](https://zetachain.com/)
