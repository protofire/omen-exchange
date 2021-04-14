import { Contract, Wallet, ethers, utils } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { getLogger } from '../util/logger'

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
}

export { StakingService }
