import { Contract, ethers, Wallet } from 'ethers'
import { getLogger } from '../util/logger'

const logger = getLogger('Services::StakingFactory')

const abi = [
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_rewardTokenAddresses',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: '_stakableTokenAddress',
        type: 'address',
      },
      {
        internalType: 'uint256[]',
        name: '_rewardAmounts',
        type: 'uint256[]',
      },
      {
        internalType: 'uint64',
        name: '_startingTimestamp',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: '_endingTimestamp',
        type: 'uint64',
      },
      {
        internalType: 'bool',
        name: '_locked',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: '_stakingCap',
        type: 'uint256',
      },
    ],
    name: 'createDistribution',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

class StakingFactoryService {
  contract: Contract
  signerAddress: Maybe<string>
  provider: any

  constructor(address: string, provider: any, signerAddress: Maybe<string>) {
    if (signerAddress) {
      const signer: Wallet = provider.getSigner()

      this.contract = new ethers.Contract(address, abi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(address, abi, provider)
    }

    this.signerAddress = signerAddress
    this.provider = provider
  }
}
