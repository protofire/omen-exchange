import { ethers } from 'ethers'

import { getContractAddress } from '../util/addresses'
import { FEE } from '../common/constants'

const marketMakerAbi = [
  `function createLMSRMarketMaker(address pmSystem, address collateralToken, bytes32[] conditionIds, uint64 fee, address whitelist, uint256 funding) public returns (address lmsrMarketMaker)`,
]

class MarketMakerService {
  static createMarketMaker = async (
    conditionId: string,
    fundingWei: ethers.utils.BigNumber,
    provider: any,
    networkId: number,
  ) => {
    const signer = provider.getSigner()

    const marketMakerAddress = getContractAddress(networkId, 'marketMakerFactory')
    const conditionalTokenAddress = getContractAddress(networkId, 'conditionalTokens')
    const daiAddress = getContractAddress(networkId, 'dai')

    const marketMakerContract = new ethers.Contract(
      marketMakerAddress,
      marketMakerAbi,
      provider,
    ).connect(signer)

    await marketMakerContract.createLMSRMarketMaker(
      conditionalTokenAddress,
      daiAddress,
      [conditionId],
      FEE,
      ethers.constants.AddressZero,
      fundingWei,
    )
  }
}

export { MarketMakerService }
