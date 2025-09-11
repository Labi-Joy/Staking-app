// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Labi Staking Contract
 * @dev A staking contract that allows users to stake ETH and earn rewards
 * Features:
 * - 30-day lock period
 * - 1% APR rewards
 * - Emergency withdrawal with 10% penalty
 * - Multiple stake positions per user
 */
contract StakingContract {
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 unlockTime;
        uint256 rewardDebt;
        bool active;
    }

    struct UserInfo {
        Stake[] stakes;
        uint256 totalStaked;
        uint256 totalRewards;
    }

    mapping(address => UserInfo) public userInfo;
    mapping(address => mapping(uint256 => Stake)) public userStakes;
    mapping(address => uint256) public userStakeCount;

    uint256 public totalStaked;
    uint256 public rewardRate = 100; // 1% per year = 100 basis points
    uint256 public constant LOCK_PERIOD = 30 days;
    uint256 public constant REWARD_PRECISION = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

    event Staked(address indexed user, uint256 amount, uint256 stakeId, uint256 unlockTime);
    event Withdrawn(address indexed user, uint256 amount, uint256 stakeId);
    event RewardsClaimed(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount, uint256 penalty);
    event RewardRateUpdated(uint256 newRate);
    event FundsDeposited(address indexed sender, uint256 amount);

    modifier validStakeId(address user, uint256 stakeId) {
        require(stakeId < userStakeCount[user], "Invalid stake ID");
        _;
    }

    modifier activeStake(address user, uint256 stakeId) {
        require(userStakes[user][stakeId].active, "Stake not active");
        _;
    }

    /**
     * @dev Stake ETH into the contract
     * Creates a new stake position with 30-day lock period
     */
    function stake() external payable {
        require(msg.value > 0, "Amount must be greater than 0");

        uint256 stakeId = userStakeCount[msg.sender];
        uint256 unlockTime = block.timestamp + LOCK_PERIOD;

        Stake storage newStake = userStakes[msg.sender][stakeId];
        newStake.amount = msg.value;
        newStake.timestamp = block.timestamp;
        newStake.unlockTime = unlockTime;
        newStake.rewardDebt = 0;
        newStake.active = true;

        userInfo[msg.sender].stakes.push(newStake);
        userInfo[msg.sender].totalStaked += msg.value;
        userStakeCount[msg.sender]++;
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value, stakeId, unlockTime);
    }

    /**
     * @dev Withdraw stake after lock period expires
     * @param stakeId The ID of the stake to withdraw
     */
    function withdraw(uint256 stakeId) external 
        validStakeId(msg.sender, stakeId) 
        activeStake(msg.sender, stakeId) 
    {
        Stake storage userStake = userStakes[msg.sender][stakeId];
        require(block.timestamp >= userStake.unlockTime, "Stake still locked");
        require(userStake.amount > 0, "No amount to withdraw");

        uint256 amount = userStake.amount;
        uint256 rewards = calculateRewards(msg.sender, stakeId);

        userStake.active = false;
        userStake.amount = 0;
        userInfo[msg.sender].totalStaked -= amount;
        totalStaked -= amount;

        if (rewards > 0) {
            userInfo[msg.sender].totalRewards += rewards;
        }

        uint256 totalAmount = amount + rewards;
        require(address(this).balance >= totalAmount, "Insufficient contract balance");

        (bool success, ) = payable(msg.sender).call{value: totalAmount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount, stakeId);
        if (rewards > 0) {
            emit RewardsClaimed(msg.sender, rewards);
        }
    }

    /**
     * @dev Claim accumulated rewards for all active stakes
     */
    function claimRewards() external {
        uint256 totalRewards = 0;
        uint256 stakeCount = userStakeCount[msg.sender];

        for (uint256 i = 0; i < stakeCount; i++) {
            if (userStakes[msg.sender][i].active) {
                uint256 rewards = calculateRewards(msg.sender, i);
                if (rewards > 0) {
                    totalRewards += rewards;
                    userStakes[msg.sender][i].rewardDebt += rewards;
                }
            }
        }

        require(totalRewards > 0, "No rewards to claim");
        require(address(this).balance >= totalRewards, "Insufficient contract balance");

        userInfo[msg.sender].totalRewards += totalRewards;

        (bool success, ) = payable(msg.sender).call{value: totalRewards}("");
        require(success, "Transfer failed");

        emit RewardsClaimed(msg.sender, totalRewards);
    }

    /**
     * @dev Emergency withdraw with 10% penalty
     * @param stakeId The ID of the stake to emergency withdraw
     */
    function emergencyWithdraw(uint256 stakeId) external 
        validStakeId(msg.sender, stakeId) 
        activeStake(msg.sender, stakeId) 
    {
        Stake storage userStake = userStakes[msg.sender][stakeId];
        require(userStake.amount > 0, "No amount to withdraw");

        uint256 amount = userStake.amount;
        uint256 penalty = (amount * 10) / 100; // 10% penalty
        uint256 withdrawAmount = amount - penalty;

        userStake.active = false;
        userStake.amount = 0;
        userInfo[msg.sender].totalStaked -= amount;
        totalStaked -= amount;

        require(address(this).balance >= withdrawAmount, "Insufficient contract balance");

        (bool success, ) = payable(msg.sender).call{value: withdrawAmount}("");
        require(success, "Transfer failed");

        emit EmergencyWithdraw(msg.sender, withdrawAmount, penalty);
    }

    /**
     * @dev Calculate pending rewards for a specific stake
     * @param user The user address
     * @param stakeId The stake ID
     * @return The amount of pending rewards
     */
    function calculateRewards(address user, uint256 stakeId) public view returns (uint256) {
        require(stakeId < userStakeCount[user], "Invalid stake ID");
        Stake storage userStake = userStakes[user][stakeId];
        
        if (!userStake.active || userStake.amount == 0) {
            return 0;
        }

        uint256 stakingTime = block.timestamp - userStake.timestamp;
        uint256 rewards = (userStake.amount * rewardRate * stakingTime) / (REWARD_PRECISION * SECONDS_PER_YEAR);
        
        return rewards > userStake.rewardDebt ? rewards - userStake.rewardDebt : 0;
    }

    // View functions
    function getUserStakes(address user) external view returns (Stake[] memory) {
        return userInfo[user].stakes;
    }

    function getUserStakeCount(address user) external view returns (uint256) {
        return userStakeCount[user];
    }

    function getUserStake(address user, uint256 stakeId) external view returns (Stake memory) {
        require(stakeId < userStakeCount[user], "Invalid stake ID");
        return userStakes[user][stakeId];
    }

    function getPendingRewards(address user) external view returns (uint256) {
        uint256 totalRewards = 0;
        uint256 stakeCount = userStakeCount[user];

        for (uint256 i = 0; i < stakeCount; i++) {
            if (userStakes[user][i].active) {
                totalRewards += calculateRewards(user, i);
            }
        }

        return totalRewards;
    }

    function getUserTotalStaked(address user) external view returns (uint256) {
        return userInfo[user].totalStaked;
    }

    function getTotalStaked() external view returns (uint256) {
        return totalStaked;
    }

    function getRewardRate() external view returns (uint256) {
        return rewardRate;
    }

    function getAPR() external view returns (uint256) {
        return rewardRate; // Returns in basis points (100 = 1%)
    }

    function getLockPeriod() external pure returns (uint256) {
        return LOCK_PERIOD;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Admin functions (for demo - in production, use proper access control)
    function setRewardRate(uint256 _rewardRate) external {
        require(_rewardRate <= 10000, "Reward rate cannot exceed 100%");
        rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }

    /**
     * @dev Deposit funds to contract for reward payments
     */
    function deposit() external payable {
        require(msg.value > 0, "Must deposit some ETH");
        emit FundsDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Receive function to accept ETH deposits
     */
    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}