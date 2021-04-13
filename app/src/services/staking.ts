import { Contract, Wallet, ethers, utils } from 'ethers'
import { BigNumber } from 'ethers/utils'

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

  static encodeStakePoolTokens = (amount: BigNumber): string => {
    const stakingInterface = new utils.Interface(abi)
    return stakingInterface.functions.stake.encode([amount])
  }
}

export { StakingService }
