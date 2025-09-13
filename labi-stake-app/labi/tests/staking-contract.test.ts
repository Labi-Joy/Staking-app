import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { EmergencyWithdrawn } from "../generated/schema"
import { EmergencyWithdrawn as EmergencyWithdrawnEvent } from "../generated/StakingContract/StakingContract"
import { handleEmergencyWithdrawn } from "../src/staking-contract"
import { createEmergencyWithdrawnEvent } from "./staking-contract-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let user = Address.fromString("0x0000000000000000000000000000000000000001")
    let amount = BigInt.fromI32(234)
    let penalty = BigInt.fromI32(234)
    let timestamp = BigInt.fromI32(234)
    let newTotalStaked = BigInt.fromI32(234)
    let newEmergencyWithdrawnEvent = createEmergencyWithdrawnEvent(
      user,
      amount,
      penalty,
      timestamp,
      newTotalStaked
    )
    handleEmergencyWithdrawn(newEmergencyWithdrawnEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("EmergencyWithdrawn created and stored", () => {
    assert.entityCount("EmergencyWithdrawn", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "EmergencyWithdrawn",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "user",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "EmergencyWithdrawn",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "amount",
      "234"
    )
    assert.fieldEquals(
      "EmergencyWithdrawn",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "penalty",
      "234"
    )
    assert.fieldEquals(
      "EmergencyWithdrawn",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "timestamp",
      "234"
    )
    assert.fieldEquals(
      "EmergencyWithdrawn",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newTotalStaked",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
