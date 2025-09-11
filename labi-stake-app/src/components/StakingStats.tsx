'use client';

import { useStakingContract } from '@/hooks/useStakingContract';

export function StakingStats() {
  const { userTotalStaked, totalStaked, apr, lockPeriod } = useStakingContract();

  const formatLockPeriod = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    return `${days} days`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Staking Statistics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Your Total Staked</p>
          <p className="text-lg font-bold text-blue-600">{parseFloat(userTotalStaked).toFixed(4)} ETH</p>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Protocol Staked</p>
          <p className="text-lg font-bold text-green-600">{parseFloat(totalStaked).toFixed(4)} ETH</p>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Current APR</p>
          <p className="text-lg font-bold text-purple-600">{apr.toFixed(2)}%</p>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Lock Period</p>
          <p className="text-lg font-bold text-orange-600">{formatLockPeriod(lockPeriod)}</p>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600 space-y-2">
        <div className="flex justify-between">
          <span>Reward calculation:</span>
          <span>Continuous compound interest</span>
        </div>
        <div className="flex justify-between">
          <span>Emergency withdrawal penalty:</span>
          <span>10% of staked amount</span>
        </div>
        <div className="flex justify-between">
          <span>Minimum stake:</span>
          <span>Any amount</span>
        </div>
      </div>
    </div>
  );
}