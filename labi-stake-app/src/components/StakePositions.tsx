'use client';

import React from 'react';
import { useStakingContract } from '@/hooks/useStakingContract';
import { useStakeToken } from '@/hooks/useStakeToken';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

interface Stake {
  amount: bigint;
  timestamp: bigint;
  unlockTime: bigint;
  rewardDebt: bigint;
  active: boolean;
}

export function StakePositions() {

  const { userStakes, normalWithdraw, emergencyWithdraw, isPending, isConfirming } = useStakingContract();
  const { tokenSymbol } = useStakeToken();
  const { isConnected } = useAccount();



  if (!isConnected) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Your Stakes</h2>
        <p className="text-gray-600">Please connect your wallet to view your stakes.</p>
      </div>
    );
  }

  const stakes = userStakes as Stake[] || [];
  const activeStakes = stakes.filter(stake => stake.active);

  if (activeStakes.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Your Stakes</h2>
        <p className="text-gray-600 mb-6">You don&apos;t have any active stakes yet.</p>
        
        {/* Preview of what stake positions will look like */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-3 text-gray-700">Preview: Your stakes will appear here</h3>
          <div className="border border-gray-200 rounded-lg p-4 bg-white opacity-75">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Amount Staked</p>
                <p className="font-semibold text-lg">0.50 {tokenSymbol || 'STAKE'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Rewards</p>
                <p className="font-semibold text-lg text-green-600">+0.0003 {tokenSymbol || 'STAKE'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Staked On</p>
                <p className="font-semibold">Today</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unlock Time</p>
                <p className="font-semibold">In 30 days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-orange-600">29d 23h</p>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  disabled
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md opacity-50 cursor-not-allowed transition-colors font-medium"
                >
                  🔒 Normal Withdraw (Locked)
                </button>
                
                <button
                  disabled
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md opacity-50 cursor-not-allowed transition-colors font-medium"
                >
                  ⚠️ Emergency Withdraw (-10%)
                </button>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <p>• Normal withdrawal: Get full amount + all rewards after lock period</p>
                <p>• Emergency withdrawal: Get 90% of staked amount immediately (no rewards)</p>
                <p>• Rewards accumulate continuously at 1% APR</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const isUnlocked = (unlockTime: bigint) => {
    return Date.now() / 1000 >= Number(unlockTime);
  };

  const getTimeUntilUnlock = (unlockTime: bigint) => {
    const now = Date.now() / 1000;
    const unlockTimestamp = Number(unlockTime);
    
    if (unlockTimestamp <= now) return 'Unlocked';
    
    const diff = unlockTimestamp - now;
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    
    return `${days}d ${hours}h`;
  };

  const calculateCurrentRewards = (stake: Stake) => {
    const now = Date.now() / 1000;
    const stakingTime = now - Number(stake.timestamp);
    const rewardRate = 100; // 1% APR in basis points
    const REWARD_PRECISION = 10000;
    const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
    
    const rewards = (Number(stake.amount) * rewardRate * stakingTime) / (REWARD_PRECISION * SECONDS_PER_YEAR);
    const rewardsAfterDebt = Math.max(0, rewards - Number(stake.rewardDebt));
    
    return formatEther(BigInt(Math.floor(rewardsAfterDebt)));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Your Stakes</h2>
      
      <div className="space-y-4">
        {activeStakes.map((stake, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Amount Staked</p>
                <p className="font-semibold text-lg">{formatEther(stake.amount)} {tokenSymbol || 'STAKE'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Rewards</p>
                <p className="font-semibold text-lg text-green-600">+{calculateCurrentRewards(stake)} {tokenSymbol || 'STAKE'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Staked On</p>
                <p className="font-semibold">{formatDate(stake.timestamp)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unlock Time</p>
                <p className="font-semibold">{formatDate(stake.unlockTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`font-semibold ${isUnlocked(stake.unlockTime) ? 'text-green-600' : 'text-orange-600'}`}>
                  {getTimeUntilUnlock(stake.unlockTime)}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => normalWithdraw(formatEther(stake.amount))}
                  disabled={!isUnlocked(stake.unlockTime) || isPending || isConfirming}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isUnlocked(stake.unlockTime) ? '🎉 Normal Withdraw + Rewards' : '🔒 Locked until ' + formatDate(stake.unlockTime)}
                </button>
                
                <button
                  onClick={() => emergencyWithdraw()}
                  disabled={isPending || isConfirming}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  title={`Emergency withdraw with 10% penalty. You'll receive ${(parseFloat(formatEther(stake.amount)) * 0.9).toFixed(4)} ${tokenSymbol || 'STAKE'}`}
                >
                  ⚠️ Emergency Withdraw (-10%)
                </button>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <p>• Normal withdrawal: Get full amount + all rewards after lock period</p>
                <p>• Emergency withdrawal: Get 90% of staked amount immediately (no rewards)</p>
                <p>• Rewards accumulate continuously at 1% APR</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}