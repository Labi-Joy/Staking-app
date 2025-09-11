import { WalletConnect } from '@/components/WalletConnect';
import { TokenMinting } from '@/components/TokenMinting';
import { StakeForm } from '@/components/StakeForm';
import { StakePositions } from '@/components/StakePositions';
import { RewardsSection } from '@/components/RewardsSection';
import { StakingStats } from '@/components/StakingStats';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Labi Stake App</h1>
          <p className="text-lg text-gray-600">Mint STAKE tokens and earn rewards on Sepolia testnet</p>
        </div>

        {/* Wallet Connection */}
        <WalletConnect />

        {/* Stats Section */}
        <div className="mb-8">
          <StakingStats />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-8">
            <TokenMinting />
            <StakeForm />
            <RewardsSection />
          </div>

          {/* Right Column */}
          <div>
            <StakePositions />
          </div>
          
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>Built with Next.js, RainbowKit, and Wagmi</p>
          <p className="mt-2">
            Contract Address: <span className="font-mono">Update after deployment</span>
          </p>
        </div>
      </div>
    </div>
  );
}
