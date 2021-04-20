import { Contract, Wallet, ethers, utils } from 'ethers'
import { BigNumber, bigNumberify, parseUnits } from 'ethers/utils'

import { STANDARD_DECIMALS } from '../common/constants'
import { getLogger } from '../util/logger'
import { getOMNToken } from '../util/networks'
import { calculateRewardApr, formatBigNumber, getRemainingRewards } from '../util/tools'
import { Token } from '../util/types'

const logger = getLogger('Services::Staking')

const abi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'stakedTokensOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address',
      },
    ],
    name: 'claimAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address',
      },
    ],
    name: 'exit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'earnedRewards',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'claimedReward',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_staker',
        type: 'address',
      },
    ],
    name: 'claimableRewards',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalStakedTokensAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'rewardAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

class StakingService {
  provider: any
  contract: Contract

  constructor(provider: any, signerAddress: Maybe<string>, campaignAddress: string) {
    this.provider = provider
    if (signerAddress) {
      const signer: Wallet = provider.getSigner()
      this.contract = new ethers.Contract(campaignAddress, abi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(campaignAddress, abi, provider)
    }
  }

  getStakedTokensOfAmount = (address: string): string => {
    return this.contract.stakedTokensOf(address)
  }

  getTotalStakedTokensAmount = (): string => {
    return this.contract.totalStakedTokensAmount()
  }

  getRewardAmount = (tokenAddress: string): string => {
    return this.contract.rewardAmount(tokenAddress)
  }

  getEarnedRewards = async (accountAddress: string, tokenAddress: string): Promise<string> => {
    return this.contract.earnedRewards(accountAddress, tokenAddress)
  }

  getClaimedRewards = async (accountAddress: string, tokenAddress: string): Promise<string> => {
    return this.contract.claimedReward(accountAddress, tokenAddress)
  }

  getClaimableRewards = async (address: string): Promise<BigNumber[]> => {
    return await this.contract.claimableRewards(address)
  }

  static encodeStakePoolTokens = (amount: BigNumber): string => {
    const stakingInterface = new utils.Interface(abi)
    return stakingInterface.functions.stake.encode([amount])
  }

  static encodeWithdrawStakedPoolTokens = (amount: BigNumber) => {
    const stakingInterface = new utils.Interface(abi)
    return stakingInterface.functions.withdraw.encode([amount])
  }

  static encodeClaimAll = (address: string) => {
    const stakingInterface = new utils.Interface(abi)
    return stakingInterface.functions.claimAll.encode([address])
  }

  static encodeExit = (address: string) => {
    const stakingInterface = new utils.Interface(abi)
    return stakingInterface.functions.exit.encode([address])
  }

  getStakingData = async (
    rewardToken: Token,
    address: string,
  ): Promise<{ earnedRewards: number; remainingRewards: number; rewardApr: number; totalRewards: number }> => {
    const userStakedTokens = Number(await this.getStakedTokensOfAmount(address)) / 10 ** STANDARD_DECIMALS
    const totalStakedTokens = Number(await this.getTotalStakedTokensAmount()) / 10 ** STANDARD_DECIMALS

    // TODO: Replace hardcoded timestamp with subgraph datum
    const endingTimestamp = 1618902000
    const timeRemaining = endingTimestamp - Math.floor(Date.now() / 1000)
    // TODO: Replace hardcoded value with subgraph datum
    const rewardsAmount = parseUnits('1', 18)
    // TODO: Replace hardcoded value with subgraph datum
    const duration = 604800

    const remainingRewards = Number(
      formatBigNumber(
        getRemainingRewards(rewardsAmount, timeRemaining, duration, rewardToken.decimals),
        rewardToken.decimals,
        rewardToken.decimals,
      ),
    )
    const clampedRemainingRewards = remainingRewards < 0 ? 0 : remainingRewards
    const rewardApr = calculateRewardApr(userStakedTokens, totalStakedTokens, timeRemaining, remainingRewards)
    const earnedRewards = Number((await this.getClaimableRewards(address))[0]) / 10 ** rewardToken.decimals
    const totalRewards = Number(await this.getRewardAmount(rewardToken.address)) / 10 ** rewardToken.decimals

    return { earnedRewards, remainingRewards: clampedRemainingRewards, rewardApr, totalRewards }
  }
}

export { StakingService }
