'use client';

import { useState, useEffect } from 'react';
import { useStakeToken } from '@/hooks/useStakeToken';
import { useAccount } from 'wagmi';

export function TokenMinting() {
  const [mintAmount, setMintAmount] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  
  const { 
    mintTokens,
    mintToAddress,
    tokenBalance, 
    tokenName, 
    tokenSymbol, 
    totalSupply,
    isPending, 
    isConfirming, 
    isConfirmed,
  } = useStakeToken();
  const { isConnected, address } = useAccount();

  // Handle alert auto-dismiss and success/error states
  useEffect(() => {
    if (isConfirmed) {
      setAlertType('success');
      setAlertMessage('🎉 Tokens minted successfully! Check your balance.');
      setShowAlert(true);
      setMintAmount('');
      
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isConfirmed]);

  const handleFaucet = () => {
    mintTokens();
  };

  const handleMintToAddress = () => {
    if (mintAmount && parseFloat(mintAmount) > 0 && address) {
      mintToAddress(address, mintAmount);
    }
  };

  const dismissAlert = () => {
    setShowAlert(false);
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🪙 Mint Tokens</h2>
        <p className="text-gray-600">Please connect your wallet to mint tokens.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">🪙 Mint {tokenSymbol || 'STAKE'} Tokens</h2>
      
      {/* Token Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Your Balance</p>
          <p className="text-lg font-bold text-blue-600">{parseFloat(tokenBalance).toFixed(2)} {tokenSymbol || 'STAKE'}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Total Supply</p>
          <p className="text-lg font-bold text-green-600">{parseFloat(totalSupply).toFixed(0)} {tokenSymbol || 'STAKE'}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Token</p>
          <p className="text-lg font-bold text-purple-600">{tokenName || 'Stake Token'}</p>
        </div>
      </div>

      {/* Minting Options */}
      <div className="space-y-6">
        {/* Free Faucet */}
        <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 bg-purple-50">
          <h3 className="text-lg font-medium mb-2 text-purple-800">🚰 Free Faucet</h3>
          <p className="text-sm text-purple-600 mb-3">Get free test tokens instantly</p>
          <button
            onClick={handleFaucet}
            disabled={isPending || isConfirming}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isPending ? '⏳ Preparing...' : isConfirming ? '⏳ Confirming...' : '🪙 Get Free Tokens'}
          </button>
        </div>

        {/* Custom Amount Mint */}
        <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 bg-blue-50">
          <h3 className="text-lg font-medium mb-2 text-blue-800">🎯 Mint Custom Amount</h3>
          <p className="text-sm text-blue-600 mb-3">Mint specific amount to your address</p>
          
          <div className="space-y-3">
            <input
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="Enter amount to mint"
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isPending || isConfirming}
            />
            
            <button
              onClick={handleMintToAddress}
              disabled={!mintAmount || parseFloat(mintAmount) <= 0 || isPending || isConfirming}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isPending ? '⏳ Preparing...' : isConfirming ? '⏳ Confirming...' : `🎯 Mint ${mintAmount || '0'} Tokens`}
            </button>
          </div>
        </div>
      </div>

      {/* Auto-dismissing Alert */}
      {showAlert && (
        <div className={`mt-4 p-3 rounded-md border flex items-center justify-between ${
          alertType === 'success' 
            ? 'bg-green-100 border-green-400 text-green-700' 
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          <span>{alertMessage}</span>
          <button
            onClick={dismissAlert}
            className="ml-2 text-sm hover:font-bold transition-all"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mt-6 bg-purple-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">💡 Token Information</h3>
        <div className="text-sm text-purple-700 space-y-1">
          <p>• <strong>Purpose:</strong> Use {tokenSymbol || 'STAKE'} tokens for staking and earning rewards</p>
          <p>• <strong>Minting:</strong> Free minting for testing purposes</p>
          <p>• <strong>Standard:</strong> ERC20 compatible token</p>
          <p>• <strong>Network:</strong> Sepolia testnet</p>
          <p>• <strong>Supply:</strong> No maximum supply limit</p>
        </div>
      </div>

      {/* Faucet Info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-purple-600">
          💧 Faucet gives you a fixed amount of tokens for testing
        </p>
      </div>
    </div>
  );
}