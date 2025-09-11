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
  const { data: userStakes, refetch: refetchUserStakes } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getUserStakes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && mounted,
    },
  });

  const { data: userStakeCount } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getUserStakeCount',
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

  const { data: userTotalStaked, refetch: refetchUserTotalStaked } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getUserTotalStaked',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && mounted,
    },
  });

  const { data: totalStaked } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getTotalStaked',
  });

  const { data: rewardRate } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getRewardRate',
  });

  const { data: apr } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getAPR',
  });

  const { data: lockPeriod } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getLockPeriod',
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

  const withdraw = (stakeId: number) => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'withdraw',
      args: [BigInt(stakeId)],
    });
  };

  const normalWithdraw = (stakeId: number) => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'normalWithdraw',
      args: [BigInt(stakeId)],
    });
  };

  const claimRewards = () => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'claimRewards',
    });
  };

  const emergencyWithdraw = (stakeId: number) => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName: 'emergencyWithdraw',
      args: [BigInt(stakeId)],
    });
  };

  // Helper functions
  const refetchAll = () => {
    refetchUserStakes();
    refetchPendingRewards();
    refetchUserTotalStaked();
  };

  return {
    // Read data
    userStakes,
    userStakeCount,
    pendingRewards: pendingRewards ? formatEther(pendingRewards) : '0',
    userTotalStaked: userTotalStaked ? formatEther(userTotalStaked) : '0',
    totalStaked: totalStaked ? formatEther(totalStaked) : '0',
    rewardRate: rewardRate ? Number(rewardRate) / 100 : 0, // Convert basis points to percentage
    apr: apr ? Number(apr) / 100 : 0, // Convert basis points to percentage
    lockPeriod: lockPeriod ? Number(lockPeriod) : 0,

    // Write functions
    stake,
    withdraw,
    normalWithdraw,
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