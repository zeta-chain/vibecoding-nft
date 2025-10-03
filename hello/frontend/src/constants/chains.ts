export interface SupportedChain {
  explorerUrl: string;
  name: string;
  chainId: number;
  icon: string;
  colorHex: string;
}

export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    explorerUrl: 'https://sepolia.basescan.org/tx/',
    name: 'Base Sepolia',
    chainId: 84532,
    icon: '/logos/base-logo.svg',
    colorHex: '#0052FF',
  },
  {
    explorerUrl: 'https://sepolia.etherscan.io/tx/',
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    icon: '/logos/ethereum-logo.svg',
    colorHex: '#3457D5',
  },
];

export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map(
  (chain) => chain.chainId
);

export const ZETACHAIN_ATHENS_BLOCKSCOUT_EXPLORER_URL =
  'https://zetachain-testnet.blockscout.com/tx/';
