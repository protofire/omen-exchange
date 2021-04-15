import { Contract, Wallet, ethers, utils } from 'ethers'
import { BigNumber, bigNumberify } from 'ethers/utils'

import { getLogger } from '../util/logger'
import { getOMNToken } from '../util/networks'

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
}

export { StakingService }
