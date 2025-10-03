import './ConfirmedContent.css';

import { useMemo } from 'react';

import { Button } from './components/Button';
import { IconReceived } from './components/icons';
import { type SupportedChain } from './constants/chains';

interface ConfirmedContentProps {
  supportedChain: SupportedChain | undefined;
  connectedChainTxHash: string;
  handleSendAnotherMessage: () => void;
  stringValue: string;
}

const MAX_STRING_LENGTH = 20;

export function ConfirmedContent({
  supportedChain,
  connectedChainTxHash,
  handleSendAnotherMessage,
  stringValue,
}: ConfirmedContentProps) {
  const renderString = useMemo(() => {
    if (stringValue.length > MAX_STRING_LENGTH) {
      return stringValue.slice(0, MAX_STRING_LENGTH) + '...';
    }
    return stringValue;
  }, [stringValue]);

  return (
    <div className="confirmed-content">
      <IconReceived />
      <h2 className="confirmed-content-title">
        NFT Minted with URI: "{renderString}"
      </h2>
      <div className="confirmed-content-links-container">
        {supportedChain && connectedChainTxHash && (
          <div className="confirmed-content-link-chain">
            <a
              href={`${supportedChain.explorerUrl}${connectedChainTxHash}`}
              target="_blank"
              rel="noreferrer noopener"
              className="confirmed-content-link confirmed-content-link-enabled"
            >
              View Transaction on {supportedChain.name}
            </a>
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="thin"
        disabled={!connectedChainTxHash}
        onClick={handleSendAnotherMessage}
      >
        Mint Another NFT
      </Button>
    </div>
  );
}
