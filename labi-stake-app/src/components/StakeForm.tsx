'use client';

import React, { useState, useEffect } from 'react';
import { useStakingContract } from '@/hooks/useStakingContract';
import { useStakeToken } from '@/hooks/useStakeToken';
import { useAccount } from 'wagmi';

export function StakeForm() {
  const [amount, setAmount] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [currentStep, setCurrentStep] = useState<'input' | 'approve' | 'stake'>('input');
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

  // Handle alert auto-dismiss and success/error states
  useEffect(() => {
    if (tokenConfirmed && currentStep === 'approve') {
      setAlertType('success');
      setAlertMessage('✅ Approval confirmed! Now you can stake your tokens.');
      setShowAlert(true);
      setCurrentStep('stake');
      
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    if (stakeConfirmed && currentStep === 'stake') {
      setAlertType('success');
      setAlertMessage('🎉 Staking successful! Your tokens are now earning rewards.');
      setShowAlert(true);
      setAmount('');
      setCurrentStep('input');
      
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [tokenConfirmed, stakeConfirmed, currentStep]);

  const handleApprove = () => {
    const amountNum = parseFloat(amount);
    if (amount && amountNum >= MINIMUM_STAKE && amountNum <= MAXIMUM_STAKE) {
      setCurrentStep('approve');
      approveStaking(amount);
    }
  };

  const handleStake = () => {
    const amountNum = parseFloat(amount);
    if (amount && amountNum >= MINIMUM_STAKE && amountNum <= MAXIMUM_STAKE) {
      setCurrentStep('stake');
      stake(amount);
    }
  };

  const dismissAlert = () => {
    setShowAlert(false);
  };

  const isPending = stakingPending || tokenPending;
  const isConfirming = stakingConfirming || tokenConfirming;
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
      
      <div className="space-y-4">
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

        {/* Two-Step Process */}
        <div className="space-y-3">
          {/* Step 1: Approve */}
          <div className={`border-2 rounded-lg p-3 ${
            currentStep === 'approve' && (isPending || isConfirming) ? 'border-yellow-300 bg-yellow-50' :
            currentStep === 'stake' ? 'border-green-300 bg-green-50' :
            'border-blue-200 bg-blue-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-800">Step 1: Approve Token Spending</h4>
              {currentStep === 'stake' && <span className="text-green-600 text-sm">✅ Completed</span>}
            </div>
            <button
              onClick={handleApprove}
              disabled={
                !amount || 
                parseFloat(amount) < MINIMUM_STAKE || 
                parseFloat(amount) > MAXIMUM_STAKE || 
                hasInsufficientFunds || 
                (isPending && currentStep === 'approve') || 
                (isConfirming && currentStep === 'approve') ||
                currentStep === 'stake' ||
                !checkNeedsApproval(amount || '0')
              }
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {(isPending && currentStep === 'approve') ? '⏳ Preparing...' : 
               (isConfirming && currentStep === 'approve') ? '⏳ Confirming...' : 
               currentStep === 'stake' ? '✅ Approved' :
               !checkNeedsApproval(amount || '0') ? '✅ Already Approved' :
               `🔓 Approve ${amount || '0'} ${tokenSymbol || 'STAKE'}`}
            </button>
          </div>

          {/* Step 2: Stake */}
          <div className={`border-2 rounded-lg p-3 ${
            currentStep === 'stake' && (isPending || isConfirming) ? 'border-yellow-300 bg-yellow-50' :
            currentStep === 'stake' || !checkNeedsApproval(amount || '0') ? 'border-green-200 bg-green-50' :
            'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-green-800">Step 2: Stake Tokens</h4>
            </div>
            <button
              onClick={handleStake}
              disabled={
                !amount || 
                parseFloat(amount) < MINIMUM_STAKE || 
                parseFloat(amount) > MAXIMUM_STAKE || 
                hasInsufficientFunds || 
                (isPending && currentStep === 'stake') || 
                (isConfirming && currentStep === 'stake') ||
                (checkNeedsApproval(amount || '0') && currentStep !== 'stake')
              }
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {(isPending && currentStep === 'stake') ? '⏳ Preparing...' : 
               (isConfirming && currentStep === 'stake') ? '⏳ Confirming...' : 
               `🎯 Stake ${amount || '0'} ${tokenSymbol || 'STAKE'}`}
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