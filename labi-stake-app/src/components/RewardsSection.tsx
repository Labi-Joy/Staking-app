'use client';

import { useStakingContract } from '@/hooks/useStakingContract';
import { useAccount } from 'wagmi';

export function RewardsSection() {
  const { pendingRewards, claimRewards, isPending, isConfirming, isConfirmed, userTotalStaked } = useStakingContract();
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">💰 Rewards</h2>
        <p className="text-gray-600">Please connect your wallet to view your rewards.</p>
      </div>
    );
  }

  const hasPendingRewards = parseFloat(pendingRewards) > 0;
  const hasStakes = parseFloat(userTotalStaked) > 0;
  
  // Calculate estimated daily rewards
  const dailyRewards = hasStakes ? (parseFloat(userTotalStaked) * 0.01) / 365 : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">💰 Rewards Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Current Rewards</p>
          <p className="text-2xl font-bold text-green-600">{parseFloat(pendingRewards).toFixed(6)} ETH</p>
          <p className="text-xs text-green-600">Ready to claim now</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Daily Earnings</p>
          <p className="text-2xl font-bold text-blue-600">~{dailyRewards.toFixed(6)} ETH</p>
          <p className="text-xs text-blue-600">At 1% APR</p>
        </div>
      </div>

      <button
        onClick={claimRewards}
        disabled={!hasPendingRewards || isPending || isConfirming}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isPending ? '⏳ Preparing...' : isConfirming ? '⏳ Confirming...' : hasPendingRewards ? '💰 Claim Rewards' : '💰 No Rewards Yet'}
      </button>

      {isConfirmed && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          🎉 Rewards claimed successfully!
        </div>
      )}

      {!hasStakes && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <p className="font-medium">Start earning rewards!</p>
          <p className="text-sm">Stake ETH to begin earning 1% APR immediately. Rewards compound continuously.</p>
        </div>
      )}

      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">📊 Reward Information</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• <strong>APR:</strong> 1% annually (0.0027% daily)</p>
          <p>• <strong>Calculation:</strong> Rewards start immediately upon staking</p>
          <p>• <strong>Claiming:</strong> No fees, claim anytime</p>
          <p>• <strong>Auto-compound:</strong> Rewards included in withdrawals</p>
          {hasStakes && (
            <p>• <strong>Your total staked:</strong> {parseFloat(userTotalStaked).toFixed(4)} ETH</p>
          )}
        </div>
      </div>
    </div>
  );
}