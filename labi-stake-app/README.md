# Labi Stake App

A decentralized staking application built with Next.js, RainbowKit, and Wagmi. Users can stake ETH, earn rewards, and manage their staking positions on the Sepolia testnet.

## Features

### Smart Contract Features
- **Stake ETH**: Users can stake any amount of ETH
- **Lock Period**: 30-day lock period for all stakes
- **Rewards System**: Continuous reward calculation based on staking time
- **Withdrawal**: Withdraw stakes after lock period expires
- **Emergency Withdrawal**: Withdraw early with 10% penalty
- **Claim Rewards**: Claim accumulated rewards separately
- **Multiple Stakes**: Users can have multiple active stake positions

### Frontend Features
- **Wallet Connection**: Connect using RainbowKit (MetaMask, WalletConnect, etc.)
- **Staking Interface**: Intuitive form to stake ETH
- **Position Management**: View all active stake positions
- **Rewards Dashboard**: Track and claim pending rewards
- **Statistics Display**: View protocol statistics and user data
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Web3**: RainbowKit, Wagmi, Viem
- **Smart Contract**: Solidity
- **Network**: Sepolia Testnet

## Prerequisites

- Node.js 18+ and pnpm
- MetaMask or other Web3 wallet
- Sepolia testnet ETH for testing

## Installation and Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd labi-stake-app
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Get your project ID from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# After deploying the contract, update this address
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### 4. Deploy the Smart Contract

The smart contract is located at `../stake-app-contract/StakingContract.sol`.

#### Using Remix IDE (Recommended for testing):
1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Copy the contract code from `stake-app-contract/StakingContract.sol`
3. Compile the contract (Solidity 0.8.19+)
4. Deploy to Sepolia testnet
5. Copy the deployed contract address

#### Using Hardhat/Foundry:
```bash
# Navigate to contract directory
cd ../stake-app-contract

# Install dependencies (if using Hardhat)
npm install

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

### 5. Update Contract Configuration

After deploying the contract, update the contract address in:
- `src/config/contract.ts` - Set `STAKING_CONTRACT_ADDRESS`
- `.env.local` - Set `NEXT_PUBLIC_CONTRACT_ADDRESS`

### 6. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Smart Contract Interface

### Write Functions
- `stake()` - Stake ETH (payable)
- `withdraw(uint256 stakeId)` - Withdraw specific stake after lock period
- `claimRewards()` - Claim all pending rewards
- `emergencyWithdraw(uint256 stakeId)` - Emergency withdraw with penalty

### Read Functions
- `getUserStakes(address user)` - Get all user stakes
- `getPendingRewards(address user)` - Get pending rewards for user
- `getUserTotalStaked(address user)` - Get total staked amount for user
- `getTotalStaked()` - Get protocol total staked amount
- `getAPR()` - Get current APR (in basis points)
- `getLockPeriod()` - Get lock period in seconds

## Usage Guide

### 1. Connect Wallet
- Click "Connect Wallet" button
- Select your preferred wallet (MetaMask recommended)
- Ensure you're connected to Sepolia testnet

### 2. Stake ETH
- Enter the amount of ETH to stake
- Click "Stake ETH" and confirm transaction
- Wait for transaction confirmation

### 3. View Stakes
- See all your active stake positions
- Check unlock times and amounts
- View current status (locked/unlocked)

### 4. Claim Rewards
- Monitor pending rewards in the rewards section
- Click "Claim Rewards" to claim accumulated rewards
- Rewards are calculated continuously based on staking time

### 5. Withdraw Stakes
- Wait for lock period to expire (30 days)
- Click "Withdraw" on unlocked stakes
- Rewards are automatically included in withdrawal

### 6. Emergency Withdrawal
- Use only if you need funds before lock period
- 10% penalty will be deducted from your stake
- Click "Emergency Withdraw" and confirm

## Project Structure

```
labi-stake-app/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── layout.tsx       # Root layout with providers
│   │   └── page.tsx         # Main staking page
│   ├── components/          # React components
│   │   ├── providers.tsx    # Web3 providers setup
│   │   ├── WalletConnect.tsx # Wallet connection
│   │   ├── StakeForm.tsx    # Staking form
│   │   ├── StakePositions.tsx # Stake positions display
│   │   ├── RewardsSection.tsx # Rewards management
│   │   └── StakingStats.tsx # Statistics display
│   ├── hooks/               # Custom React hooks
│   │   └── useStakingContract.ts # Contract interaction hook
│   └── config/              # Configuration files
│       ├── wagmi.ts         # Wagmi configuration
│       └── contract.ts      # Contract ABI and address
├── stake-app-contract/      # Smart contract
│   └── StakingContract.sol  # Main staking contract
└── package.json
```

## Contract Parameters

- **Lock Period**: 30 days (2,592,000 seconds)
- **Reward Rate**: 1% APR (100 basis points)
- **Emergency Withdrawal Penalty**: 10%
- **Minimum Stake**: No minimum (any amount > 0)

## Testing

### Get Sepolia Testnet ETH
1. Use a Sepolia faucet:
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Chainlink Sepolia Faucet](https://faucets.chain.link/)
2. Add Sepolia network to your wallet if not already added

### Test Scenarios
1. **Basic Staking**: Stake small amounts and verify positions
2. **Multiple Stakes**: Create multiple stake positions
3. **Rewards**: Wait and check reward accumulation
4. **Withdrawal**: Test normal withdrawal after lock period
5. **Emergency Withdrawal**: Test emergency withdrawal with penalty
6. **Claim Rewards**: Test reward claiming functionality

## Deployment

### Frontend Deployment (Vercel)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Frontend Deployment (Other Platforms)
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Troubleshooting

### Common Issues

1. **Contract Address Not Set**
   - Ensure `STAKING_CONTRACT_ADDRESS` is set in `src/config/contract.ts`
   - Update after contract deployment

2. **Wallet Connection Issues**
   - Verify WalletConnect Project ID is set
   - Check network is set to Sepolia

3. **Transaction Failures**
   - Ensure sufficient ETH for gas fees
   - Check contract is deployed and accessible
   - Verify contract address is correct

4. **Build Errors**
   - Run `pnpm install` to ensure all dependencies are installed
   - Check TypeScript errors with `pnpm build`

### Getting Help

If you encounter issues:
1. Check browser console for errors
2. Verify contract deployment on Sepolia Etherscan
3. Ensure wallet has sufficient testnet ETH
4. Check that all environment variables are set correctly

## License

MIT License