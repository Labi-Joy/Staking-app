import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { STAKE_TOKEN_ADDRESS, STAKE_TOKEN_ABI } from '@/config/tokenContract';
import { STAKING_CONTRACT_ADDRESS } from '@/config/contract';
import { useEffect, useState } from 'react';

export function useStakeToken() {
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
  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: STAKE_TOKEN_ADDRESS,
    abi: STAKE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && mounted,
    },
  });

  const { data: tokenName } = useReadContract({
    address: STAKE_TOKEN_ADDRESS,
    abi: STAKE_TOKEN_ABI,
    functionName: 'name',
    query: {
      enabled: mounted,
    },
  });

  const { data: tokenSymbol } = useReadContract({
    address: STAKE_TOKEN_ADDRESS,
    abi: STAKE_TOKEN_ABI,
    functionName: 'symbol',
    query: {
      enabled: mounted,
    },
  });

  const { data: tokenDecimals } = useReadContract({
    address: STAKE_TOKEN_ADDRESS,
    abi: STAKE_TOKEN_ABI,
    functionName: 'decimals',
    query: {
      enabled: mounted,
    },
  });

  const { data: totalSupply } = useReadContract({
    address: STAKE_TOKEN_ADDRESS,
    abi: STAKE_TOKEN_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: mounted,
    },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: STAKE_TOKEN_ADDRESS,
    abi: STAKE_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, STAKING_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!address && mounted,
    },
  });

  // Write functions
  const mintTokens = (amount: string) => {
    writeContract({
      address: STAKE_TOKEN_ADDRESS,
      abi: STAKE_TOKEN_ABI,
      functionName: 'mintToSelf',
      args: [parseEther(amount)],
    });
  };

  const approveStaking = (amount: string) => {
    writeContract({
      address: STAKE_TOKEN_ADDRESS,
      abi: STAKE_TOKEN_ABI,
      functionName: 'approve',
      args: [STAKING_CONTRACT_ADDRESS, parseEther(amount)],
    });
  };

  const increaseAllowance = (amount: string) => {
    writeContract({
      address: STAKE_TOKEN_ADDRESS,
      abi: STAKE_TOKEN_ABI,
      functionName: 'increaseAllowance',
      args: [STAKING_CONTRACT_ADDRESS, parseEther(amount)],
    });
  };

  // Helper functions
  const needsApproval = (stakeAmount: string) => {
    if (!allowance || !stakeAmount) return true;
    return parseEther(stakeAmount) > allowance;
  };

  const hasInsufficientBalance = (stakeAmount: string) => {
    if (!tokenBalance || !stakeAmount) return true;
    return parseEther(stakeAmount) > tokenBalance;
  };

  const refetchAll = () => {
    refetchBalance();
    refetchAllowance();
  };

  return {
    // Token information
    tokenName: tokenName as string,
    tokenSymbol: tokenSymbol as string,
    tokenDecimals: tokenDecimals as number,
    totalSupply: totalSupply ? formatEther(totalSupply) : '0',
    
    // User balance and allowances
    tokenBalance: tokenBalance ? formatEther(tokenBalance) : '0',
    allowance: allowance ? formatEther(allowance) : '0',
    
    // Write functions
    mintTokens,
    approveStaking,
    increaseAllowance,
    
    // Helper functions
    needsApproval,
    hasInsufficientBalance,
    
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