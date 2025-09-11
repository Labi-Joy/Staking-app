'use client';

import { useStakeToken } from '@/hooks/useStakeToken';
import { useAccount } from 'wagmi';

export function TokenMinting() {
  const { 
    mintTokens, 
    tokenBalance, 
    tokenName, 
    tokenSymbol, 
    totalSupply,
    isPending, 
    isConfirming, 
    isConfirmed 
  } = useStakeToken();
  const { isConnected } = useAccount();


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

      {/* Faucet Button */}
      <div className="space-y-4">
        <button
          onClick={() => mintTokens()}
          disabled={isPending || isConfirming}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
        >
          {isPending ? '⏳ Preparing...' : isConfirming ? '⏳ Confirming...' : '🪙 Get Free Tokens from Faucet'}
        </button>
      </div>

      {isConfirmed && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          🎉 Tokens minted successfully! Check your balance.
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