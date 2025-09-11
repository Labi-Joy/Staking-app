'use client';

import React, { useState } from 'react';
import { useStakingContract } from '@/hooks/useStakingContract';
import { useStakeToken } from '@/hooks/useStakeToken';
import { useAccount } from 'wagmi';

export function StakeForm() {
  const [amount, setAmount] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const { stake, isPending: stakingPending, isConfirming: stakingConfirming, isConfirmed: stakeConfirmed } = useStakingContract();
  const { 
    tokenBalance, 
    tokenSymbol, 
    approveStaking, 
    needsApproval: checkNeedsApproval, 
    hasInsufficientBalance,
    isPending: tokenPending,
    isConfirming: tokenConfirming,
    isConfirmed: tokenConfirmed 
  } = useStakeToken();
  const { isConnected } = useAccount();

  const MINIMUM_STAKE = 1; // Set minimum stake to 1 STAKE token
  const MAXIMUM_STAKE = 1000; // Set maximum stake to 1000 STAKE tokens

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (amount && amountNum >= MINIMUM_STAKE && amountNum <= MAXIMUM_STAKE) {
      if (checkNeedsApproval(amount)) {
        setNeedsApproval(true);
        approveStaking(amount);
      } else {
        stake(amount);
      }
    }
  };

  // Check if we should proceed to staking after approval
  React.useEffect(() => {
    if (needsApproval && tokenConfirmed && amount) {
      setNeedsApproval(false);
      stake(amount);
    }
  }, [tokenConfirmed, needsApproval, amount, stake]);

  const isPending = stakingPending || tokenPending;
  const isConfirming = stakingConfirming || tokenConfirming;
  const isConfirmed = stakeConfirmed || tokenConfirmed;
  const hasInsufficientFunds = amount ? hasInsufficientBalance(amount) : false;

  if (!isConnected) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Stake {tokenSymbol || 'STAKE'} Tokens</h2>
        <p className="text-gray-600">Please connect your wallet to stake tokens.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Stake {tokenSymbol || 'STAKE'} Tokens</h2>
      
      {/* Token Balance Display */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-600">Your {tokenSymbol || 'STAKE'} Balance</p>
        <p className="text-lg font-bold text-blue-800">{parseFloat(tokenBalance).toFixed(2)} {tokenSymbol || 'STAKE'}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount ({tokenSymbol || 'STAKE'})
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Minimum: ${MINIMUM_STAKE} ${tokenSymbol || 'STAKE'}`}
            min={MINIMUM_STAKE}
            max={MAXIMUM_STAKE}
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isPending || isConfirming}
          />
          {amount && (parseFloat(amount) < MINIMUM_STAKE || parseFloat(amount) > MAXIMUM_STAKE) && (
            <p className="text-red-500 text-sm mt-1">
              Amount must be between {MINIMUM_STAKE} and {MAXIMUM_STAKE} {tokenSymbol || 'STAKE'}
            </p>
          )}
          {hasInsufficientFunds && (
            <p className="text-red-500 text-sm mt-1">
              Insufficient balance. You have {parseFloat(tokenBalance).toFixed(2)} {tokenSymbol || 'STAKE'}
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!amount || parseFloat(amount) < MINIMUM_STAKE || parseFloat(amount) > MAXIMUM_STAKE || hasInsufficientFunds || isPending || isConfirming}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isPending ? '⏳ Preparing...' : 
           isConfirming ? '⏳ Confirming...' : 
           needsApproval ? '✅ Approve & Stake' :
           checkNeedsApproval(amount || '0') ? `🔓 Approve ${tokenSymbol || 'STAKE'}` :
           `🎯 Stake ${tokenSymbol || 'STAKE'}`}
        </button>
      </form>

      {isConfirmed && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          🎉 {needsApproval ? 'Approval confirmed! Proceeding to stake...' : 'Staking transaction confirmed!'}
        </div>
      )}

      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">🎯 Staking Benefits</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>Immediate rewards:</strong> Earn 1% APR from the moment you stake</p>
          <p>• <strong>Range:</strong> {MINIMUM_STAKE} - {MAXIMUM_STAKE} {tokenSymbol || 'STAKE'} per stake</p>
          <p>• <strong>Lock period:</strong> 30 days for maximum security</p>
          <p>• <strong>Flexibility:</strong> Emergency withdrawal available (10% fee)</p>
          <p>• <strong>No fees:</strong> Claim rewards anytime without cost</p>
        </div>
      </div>
    </div>
  );
}