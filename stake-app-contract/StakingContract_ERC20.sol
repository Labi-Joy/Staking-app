// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title ERC20 Staking Contract
 * @dev A staking contract that allows users to stake ERC20 tokens and earn rewards
 * Features:
 * - 30-day lock period
 * - 1% APR rewards in the same token
 * - Emergency withdrawal with 10% penalty
 * - Normal withdrawal after lock period
 * - Multiple stake positions per user
 */
contract StakingContractERC20 {
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

    IERC20 public immutable stakingToken;
    
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
    event NormalWithdrawn(address indexed user, uint256 amount, uint256 rewards, uint256 stakeId);
    event RewardsClaimed(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount, uint256 penalty);
    event RewardRateUpdated(uint256 newRate);

    modifier validStakeId(address user, uint256 stakeId) {
        require(stakeId < userStakeCount[user], "Invalid stake ID");
        _;
    }

    modifier activeStake(address user, uint256 stakeId) {
        require(userStakes[user][stakeId].active, "Stake not active");
        _;
    }

    constructor(address _stakingToken) {
        require(_stakingToken != address(0), "Invalid token address");
        stakingToken = IERC20(_stakingToken);
    }

    /**
     * @dev Stake ERC20 tokens into the contract
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        uint256 stakeId = userStakeCount[msg.sender];
        uint256 unlockTime = block.timestamp + LOCK_PERIOD;

        Stake storage newStake = userStakes[msg.sender][stakeId];
        newStake.amount = amount;
        newStake.timestamp = block.timestamp;
        newStake.unlockTime = unlockTime;
        newStake.rewardDebt = 0;
        newStake.active = true;

        userInfo[msg.sender].stakes.push(newStake);
        userInfo[msg.sender].totalStaked += amount;
        userStakeCount[msg.sender]++;
        totalStaked += amount;

        emit Staked(msg.sender, amount, stakeId, unlockTime);
    }

    /**
     * @dev Normal withdraw stake after lock period expires (includes rewards)
     * @param stakeId The ID of the stake to withdraw
     */
    function normalWithdraw(uint256 stakeId) external 
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
        require(stakingToken.balanceOf(address(this)) >= totalAmount, "Insufficient contract balance");
        require(stakingToken.transfer(msg.sender, totalAmount), "Transfer failed");

        emit NormalWithdrawn(msg.sender, amount, rewards, stakeId);
    }

    /**
     * @dev Withdraw stake only (no rewards) - for compatibility
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

        userStake.active = false;
        userStake.amount = 0;
        userInfo[msg.sender].totalStaked -= amount;
        totalStaked -= amount;

        require(stakingToken.balanceOf(address(this)) >= amount, "Insufficient contract balance");
        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");

        emit Withdrawn(msg.sender, amount, stakeId);
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
        require(stakingToken.balanceOf(address(this)) >= totalRewards, "Insufficient contract balance");

        userInfo[msg.sender].totalRewards += totalRewards;
        require(stakingToken.transfer(msg.sender, totalRewards), "Transfer failed");

        emit RewardsClaimed(msg.sender, totalRewards);
    }

    /**
     * @dev Emergency withdraw with 10% penalty (no rewards)
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

        require(stakingToken.balanceOf(address(this)) >= withdrawAmount, "Insufficient contract balance");
        require(stakingToken.transfer(msg.sender, withdrawAmount), "Transfer failed");

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

    function getStakingToken() external view returns (address) {
        return address(stakingToken);
    }

    function getContractTokenBalance() external view returns (uint256) {
        return stakingToken.balanceOf(address(this));
    }

    // Admin functions (for demo - in production, use proper access control)
    function setRewardRate(uint256 _rewardRate) external {
        require(_rewardRate <= 10000, "Reward rate cannot exceed 100%");
        rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }
}