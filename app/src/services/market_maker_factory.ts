import { Contract, ethers, Wallet } from 'ethers'
import { LogDescription } from 'ethers/utils/interface'

import { ConditionalTokenService } from './conditional_token'
import { MarketMakerService } from './market_maker'
import { RealitioService } from './realitio'

import { getLogger } from '../util/logger'
import { Market, MarketWithExtraData, Log } from '../util/types'
import { MARKET_FEE } from '../common/constants'

const logger = getLogger('Services::MarketMakerFactory')

interface GetMarketsOptions {
  from: number
  to: number
}

const marketMakerFactoryAbi = [
  `function createFixedProductMarketMaker(address conditionalTokens, address collateralToken, bytes32[] conditionIds, uint fee) public returns (address)`,
  `event FixedProductMarketMakerCreation(address indexed creator, address fixedProductMarketMaker, address conditionalTokens, address collateralToken, bytes32[] conditionIds, uint fee)`,
]
const marketMakerFactoryCallAbi = [
  `function createFixedProductMarketMaker(address conditionalTokens, address collateralToken, bytes32[] conditionIds, uint fee) public constant returns (address)`,
]

class MarketMakerFactoryService {
  contract: Contract
  constantContract: Contract
  signerAddress: Maybe<string>
  provider: any

  constructor(address: string, provider: any, signerAddress: Maybe<string>) {
    if (signerAddress) {
      const signer: Wallet = provider.getSigner()

      this.contract = new ethers.Contract(address, marketMakerFactoryAbi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(address, marketMakerFactoryAbi, provider)
    }

    this.constantContract = new ethers.Contract(address, marketMakerFactoryCallAbi, provider)
    this.signerAddress = signerAddress
    this.provider = provider
  }

  createMarketMaker = async (
    conditionalTokenAddress: string,
    collateralAddress: string,
    conditionId: string,
  ) => {
    const feeBN = ethers.utils.parseEther('' + MARKET_FEE / Math.pow(10, 2))

    const args = [conditionalTokenAddress, collateralAddress, [conditionId], feeBN]

    const marketMakerAddress = await this.constantContract.createFixedProductMarketMaker(...args, {
      from: this.signerAddress,
    })

    const transactionObject = await this.contract.createFixedProductMarketMaker(...args, {
      value: '0x0',
    })
    await this.provider.waitForTransaction(transactionObject.hash)

    return marketMakerAddress
  }

  getMarkets = async ({ from, to }: GetMarketsOptions): Promise<Market[]> => {
    logger.debug(`Fetching markets from '${from}' to '${to}'`)
    const filter: any = this.contract.filters.FixedProductMarketMakerCreation()

    const logs = await this.provider.getLogs({
      ...filter,
      fromBlock: from,
      toBlock: to,
    })

    if (logs.length === 0) {
      return []
    }

    const interfaceMarketMakerFactory = new ethers.utils.Interface(marketMakerFactoryAbi)
    const markets = logs.map(
      (log: Log): Market => {
        const parsedLog: LogDescription = interfaceMarketMakerFactory.parseLog(log)
        const { fixedProductMarketMaker, creator, collateralToken, conditionIds } = parsedLog.values

        return {
          address: fixedProductMarketMaker,
          ownerAddress: creator,
          conditionId: conditionIds[0],
          collateralTokenAddress: collateralToken,
        }
      },
    )

    return markets
  }

  getMarketsWithExtraData = async (
    { from, to }: GetMarketsOptions,
    conditionalTokens: ConditionalTokenService,
    realitio: RealitioService,
  ): Promise<MarketWithExtraData[]> => {
    const markets = await this.getMarkets({ from, to })

    const marketsWithExtraData = await Promise.all(
      markets.map(market => {
        const marketMaker = new MarketMakerService(
          market.address,
          conditionalTokens,
          realitio,
          this.provider,
          this.signerAddress,
        )
        return marketMaker.getExtraData(market)
      }),
    )

    const feeBN = ethers.utils.parseEther('' + MARKET_FEE / Math.pow(10, 2))

    const validMarkets = marketsWithExtraData.filter(market => market.fee.eq(feeBN))

    return validMarkets
  }
}

export { MarketMakerFactoryService }
