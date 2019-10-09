import { Contract, ethers, Wallet } from 'ethers'

import { FEE } from '../common/constants'

const marketMakerFactoryAbi = [
  `function createLMSRMarketMaker(address pmSystem, address collateralToken, bytes32[] conditionIds, uint64 fee, address whitelist, uint256 funding) public returns (address lmsrMarketMaker)`,
]
const marketMakerFactoryCallAbi = [
  `function createLMSRMarketMaker(address pmSystem, address collateralToken, bytes32[] conditionIds, uint64 fee, address whitelist, uint256 funding) public constant returns (address lmsrMarketMaker)`,
]

class MarketMakerFactoryService {
  contract: Contract
  constantContract: Contract
  signerAddress: string

  constructor(address: string, provider: any, signerAddress: string) {
    const signer: Wallet = provider.getSigner()

    this.contract = new ethers.Contract(address, marketMakerFactoryAbi, provider).connect(signer)
    this.constantContract = new ethers.Contract(address, marketMakerFactoryCallAbi, provider)
    this.signerAddress = signerAddress
  }

  createMarketMaker = async (
    conditionalTokenAddress: string,
    daiAddress: string,
    conditionId: string,
    fundingWei: ethers.utils.BigNumber,
  ) => {
    const args = [
      conditionalTokenAddress,
      daiAddress,
      [conditionId],
      FEE,
      ethers.constants.AddressZero,
      fundingWei,
    ]

    const marketMakerAddress = await this.constantContract.createLMSRMarketMaker(...args, {
      from: this.signerAddress,
    })

    await this.contract.createLMSRMarketMaker(...args)

    return marketMakerAddress
  }
}

export { MarketMakerFactoryService }
