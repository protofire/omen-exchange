import { ethers } from 'ethers'
import { BigNumberish } from 'ethers/utils'

import { getContractAddress } from '../util/addresses'
import { FEE } from '../common/constants'

const marketMakerAbi = [
  'function trade(int[] outcomeTokenAmounts, int collateralLimit) public returns (int netCost)',
  'function calcNetCost(int[] outcomeTokenAmounts) public view returns (int netCost)',
  'function calcMarketFee(uint outcomeTokenCost) public view returns (uint)',
  'function withdrawFees() public returns (uint fees)',
]

const marketMakerFactoryAbi = [
  `function createLMSRMarketMaker(address pmSystem, address collateralToken, bytes32[] conditionIds, uint64 fee, address whitelist, uint256 funding) public returns (address lmsrMarketMaker)`,
]
const marketMakerFactoryCallAbi = [
  `function createLMSRMarketMaker(address pmSystem, address collateralToken, bytes32[] conditionIds, uint64 fee, address whitelist, uint256 funding) public constant returns (address lmsrMarketMaker)`,
]

class MarketMakerService {
  address: string

  constructor(address: string) {
    this.address = address
  }

  trade = async (provider: any, outcomeTokenAmounts: BigNumberish[]) => {
    const signer = provider.getSigner()

    const marketMakerContract = new ethers.Contract(this.address, marketMakerAbi, provider).connect(
      signer,
    )

    await marketMakerContract.trade(outcomeTokenAmounts, 0)
  }

  withdrawFees = async (provider: any) => {
    const signer = provider.getSigner()

    const marketMakerContract = new ethers.Contract(this.address, marketMakerAbi, provider).connect(
      signer,
    )

    return await marketMakerContract.withdrawFees()
  }

  calculateNetCost = async (provider: any, outcomeTokenAmounts: BigNumberish[]) => {
    const signer = provider.getSigner()

    const marketMakerContract = new ethers.Contract(this.address, marketMakerAbi, provider).connect(
      signer,
    )

    return await marketMakerContract.calcNetCost(outcomeTokenAmounts)
  }

  calculateMarketFee = async (provider: any, outcomeTokenCost: any) => {
    const signer = provider.getSigner()

    const marketMakerContract = new ethers.Contract(this.address, marketMakerAbi, provider).connect(
      signer,
    )

    return await marketMakerContract.calcMarketFee(outcomeTokenCost)
  }

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

    const marketMakerFactoryConstantContract = new ethers.Contract(
      marketMakerFactoryAddress,
      marketMakerFactoryCallAbi,
      provider,
    )
    const marketMakerFactoryContract = new ethers.Contract(
      marketMakerFactoryAddress,
      marketMakerFactoryAbi,
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

    const marketMakerAddress = await marketMakerFactoryConstantContract.createLMSRMarketMaker(
      ...args,
      {
        from: signerAddress,
      },
    )

    await marketMakerFactoryContract.createLMSRMarketMaker(...args)

    return marketMakerAddress
  }
}

export { MarketMakerService }
