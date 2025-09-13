import {
  RewardsClaimed as RewardsClaimedEvent,
  Staked as StakedEvent,
  Withdrawn as WithdrawnEvent,
  Deposited as DepositedEvent,
  StakeWithdrawn as StakeWithdrawnEvent,
  EarlyWithdrawal as EarlyWithdrawalEvent,
  User as UserEvent
} from "../generated/StakingContract/StakingContract"
import {
  RewardsClaimed,
  Staked,
  Withdrawn,
  Deposited,
  StakeWithdrawn,
  EarlyWithdrawal,
  User
} from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"

type UserEventType = {
  params: {
    user: string
  },
  block: {
    timestamp: any,
    number: any
  },
  transaction: {
    hash: any
  }
};

export function handleUser(event: UserEventType): void {
  let entity = User.load(event.params.user)
  
  if (!entity) {
    entity = new User(event.params.user)
    entity.totalStaked = BigInt.fromI32(0)
    entity.totalRewardsClaimed = BigInt.fromI32(0)
    entity.stakeCount = BigInt.fromI32(0)
    entity.firstStakeTimestamp = event.block.timestamp
    entity.isActive = false
  }
  
  entity.lastActivityTimestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  
  entity.save()
}

export function handleRewardsClaimed(event: RewardsClaimedEvent): void {
  let entity = new RewardsClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.rewardAmount = event.params.rewardAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStaked(event: StakedEvent): void {
  let entity = new Staked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.amount = event.params.amount
  entity.timestamp = event.params.timestamp
  entity.newTotalStaked = event.params.newTotalStaked
  entity.currentRewardRate = event.params.currentRewardRate

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWithdrawn(event: WithdrawnEvent): void {
  let entity = new Withdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDeposited(event: DepositedEvent): void {
  let entity = new Deposited(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.amount = event.params.amount
  entity.newUserBalance = event.params.newUserBalance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStakeWithdrawn(event: StakeWithdrawnEvent): void {
  let entity = new StakeWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.amount = event.params.amount
  entity.remainingBalance = event.params.remainingBalance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEarlyWithdrawal(event: EarlyWithdrawalEvent): void {
  let entity = new EarlyWithdrawal(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.amount = event.params.amount
  entity.penaltyAmount = event.params.penaltyAmount
  entity.actualReceived = event.params.actualReceived

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}