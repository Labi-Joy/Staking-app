import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI } from '@/config/contract';
import { useEffect, useState } from 'react';

export function useStakingContract() {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read functions
  const { data: userDetails, refetch: refetchUserDetails } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getUserDetails',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && mounted,
    },
  });

  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'userInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && mounted,
    },
  });

  const { data: pendingRewards, refetch: refetchPendingRewards } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getPendingRewards',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && mounted,
    },
  });

  const { data: timeUntilUnlock } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getTimeUntilUnlock',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && mounted,
    },
  });

  const { data: totalStaked } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'totalStaked',
  });

  const { data: currentRewardRate } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'currentRewardRate',
  });

  const { data: initialApr } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'initialApr',
  });

  const { data: minLockDuration } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'minLockDuration',
  });

  const { data: emergencyWithdrawPenalty } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'emergencyWithdrawPenalty',
  });

  // Write functions
  const stake = (amount: string) => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'stake',
      args: [parseEther(amount)],
    });
  };

  const withdraw = (amount: string) => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'withdraw',
      args: [parseEther(amount)],
    });
  };

  const emergencyWithdraw = () => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'emergencyWithdraw',
      args: [],
    });
  };

  const claimRewards = () => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'claimRewards',
    });
  };

  // Helper functions
  const refetchAll = () => {
    refetchUserDetails();
    refetchUserInfo();
    refetchPendingRewards();
  };

  // Extract values from userDetails - safely access tuple/object properties
  const stakedAmount = userDetails && typeof userDetails === 'object' && 'stakedAmount' in userDetails 
    ? (userDetails as { stakedAmount: bigint }).stakedAmount : BigInt(0);
  const lastStakeTimestamp = userDetails && typeof userDetails === 'object' && 'lastStakeTimestamp' in userDetails 
    ? (userDetails as { lastStakeTimestamp: bigint }).lastStakeTimestamp : BigInt(0);
  const canWithdraw = userDetails && typeof userDetails === 'object' && 'canWithdraw' in userDetails 
    ? (userDetails as { canWithdraw: boolean }).canWithdraw : false;

  // Create a compatible format for existing UI components
  const userStakes = stakedAmount > BigInt(0) ? [{
    amount: stakedAmount,
    timestamp: lastStakeTimestamp,
    unlockTime: lastStakeTimestamp + (minLockDuration || BigInt(0)),
    rewardDebt: BigInt(0),
    active: true
  }] : [];

  return {
    // Read data - compatible with existing UI
    userStakes,
    userStakeCount: stakedAmount > BigInt(0) ? BigInt(1) : BigInt(0),
    pendingRewards: pendingRewards ? formatEther(pendingRewards) : '0',
    userTotalStaked: stakedAmount ? formatEther(stakedAmount) : '0',
    totalStaked: totalStaked ? formatEther(totalStaked) : '0',
    rewardRate: currentRewardRate ? Number(currentRewardRate) : 0,
    apr: initialApr ? Number(initialApr) : 0,
    lockPeriod: minLockDuration ? Number(minLockDuration) : 0,
    
    // New data from updated contract
    userDetails,
    userInfo,
    timeUntilUnlock: timeUntilUnlock ? Number(timeUntilUnlock) : 0,
    canWithdraw,
    emergencyWithdrawPenalty: emergencyWithdrawPenalty ? Number(emergencyWithdrawPenalty) : 1000, // 10%

    // Write functions - updated for new contract
    stake,
    withdraw,
    normalWithdraw: withdraw, // Alias for compatibility
    claimRewards,
    emergencyWithdraw,

    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    hash,

    // Utility
    refetchAll,
    formatEther,
    parseEther,
  };
}