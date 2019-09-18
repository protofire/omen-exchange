import { ethers } from 'ethers'

import { getContractAddress } from '../util/addresses'
import { FEE } from '../common/constants'

const marketMakerAbi = [
  `function createLMSRMarketMaker(address pmSystem, address collateralToken, bytes32[] conditionIds, uint64 fee, address whitelist, uint256 funding) public returns (address lmsrMarketMaker)`,
]
const marketMakerCallAbi = [
  `function createLMSRMarketMaker(address pmSystem, address collateralToken, bytes32[] conditionIds, uint64 fee, address whitelist, uint256 funding) public constant returns (address lmsrMarketMaker)`,
]

class MarketMakerService {
  static createMarketMaker = async (
    conditionId: string,
    fundingWei: ethers.utils.BigNumber,
    provider: any,
    networkId: number,
  ) => {
    const signer = provider.getSigner()
    const signerAddress = await signer.getAddress()

    const marketMakerFactoryAddress = getContractAddress(networkId, 'marketMakerFactory')
    const conditionalTokenAddress = getContractAddress(networkId, 'conditionalTokens')
    const daiAddress = getContractAddress(networkId, 'dai')

    const marketMakerConstantContract = new ethers.Contract(
      marketMakerFactoryAddress,
      marketMakerCallAbi,
      provider,
    )
    const marketMakerContract = new ethers.Contract(
      marketMakerFactoryAddress,
      marketMakerAbi,
      provider,
    ).connect(signer)

    const args = [
      conditionalTokenAddress,
      daiAddress,
      [conditionId],
      FEE,
      ethers.constants.AddressZero,
      fundingWei,
    ]

    const marketMakerAddress = await marketMakerConstantContract.createLMSRMarketMaker(...args, {
      from: signerAddress,
    })

    await marketMakerContract.createLMSRMarketMaker(...args)

    return marketMakerAddress
  }
}

export { MarketMakerService }
