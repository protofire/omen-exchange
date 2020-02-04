import { Contract, ethers, Wallet } from 'ethers'

import { Token } from '../util/types'
import { getTokensByNetwork, networkIds } from '../util/networks'

const klerosInteractionAbi = [
  'function queryTokens(bytes32 _cursor, uint _count, bool[8] _filter, bool _oldestFirst, address _tokenAddr) external view returns (bytes32[] values, bool hasMore)',
  'function getTokenInfo(bytes32 _tokenID) external view returns (string name, string ticker, address addr, string symbolMultihash, uint8 status, uint numberOfRequests )',
]

const zeroSubmissionID = '0x0000000000000000000000000000000000000000000000000000000000000000'

class KlerosInteractionService {
  provider: any
  contract: Contract

  constructor(provider: any, signerAddress: Maybe<string>, contractAddress: string) {
    this.provider = provider
    if (signerAddress) {
      const signer: Wallet = provider.getSigner()
      this.contract = new ethers.Contract(contractAddress, klerosInteractionAbi, provider).connect(
        signer,
      )
    } else {
      this.contract = new ethers.Contract(contractAddress, klerosInteractionAbi, provider)
    }
  }

  get address(): string {
    return this.contract.address
  }

  /**
   * Return the tokens from the KLEROS TCR already registered
   * @returns {Promise<any[]>}
   */
  queryTokens = async (): Promise<Token[]> => {
    const network = await this.provider.getNetwork()
    const networkId = network.chainId

    if (networkId !== networkIds.MAINNET) {
      // Use mocked information from networks file
      return getTokensByNetwork(networkId)
    } else {
      const filter = [
        false, // Include absent tokens in result
        true, // Include registered tokens in result.
        false, // Include tokens with registration requests that are not disputed in result.
        false, // Include tokens with clearing requests that are not disputed in result.
        false, // Include disputed tokens with registration requests in result.
        false, //Include disputed tokens with clearing requests in result.
        false, // Include tokens submitted by the caller.
        false, // Include tokens challenged by the caller.
      ]

      const resultQueryTokens = await this.contract.queryTokens(
        zeroSubmissionID,
        500, // Number of items to return at once.
        filter,
        true, // Return oldest first.
        ethers.constants.AddressZero, // The token address for which to return the submissions
      )

      const [tokensIds] = resultQueryTokens

      const tokenPromises = tokensIds.map((tokenId: string) => this.contract.getTokenInfo(tokenId))
      const tokens = await Promise.all(tokenPromises)
      const result = tokens
        .filter((token: any) => token.addr !== ethers.constants.AddressZero)
        .map(
          (token: any): Token => {
            return {
              symbol: token.ticker,
              address: token.addr,
              decimals: 0,
            }
          },
        )

      const basicOrder = ['dai', 'cdai', 'weth', 'usdc', 'owl', 'chai'].reverse()

      return result.sort((tokenA: Token, tokenB: Token) => {
        let sortBy: number

        const indexOfB = basicOrder.indexOf(tokenB.symbol.toLowerCase())
        const indexOfA = basicOrder.indexOf(tokenA.symbol.toLowerCase())
        if (indexOfB !== -1 || indexOfA !== -1) {
          sortBy = indexOfB - indexOfA
        } else {
          sortBy = tokenA.symbol.localeCompare(tokenB.symbol)
        }

        return sortBy
      })
    }
  }
}

export { KlerosInteractionService }
