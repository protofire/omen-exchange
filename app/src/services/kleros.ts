import { Contract, ethers } from 'ethers'

import { Token } from '../util/types'
import { getTokensByNetwork, networkIds } from '../util/networks'
import { Web3Provider } from 'ethers/providers'

const klerosBadgeAbi = [
  'function queryAddresses(address _cursor, uint _count, bool[8] _filter, bool _oldestFirst) external view returns (address[] values, bool hasMore)',
]

const klerosTokensViewAbi = [
  'function getTokensIDsForAddresses(address _t2crAddress, address[] _tokenAddresses ) external view returns (bytes32[] result)',
  'function getTokens(address _t2crAddress, bytes32[] _tokenIDs ) external view returns (tuple(bytes32 ID, string name, string ticker, address addr, string symbolMultihash, uint8 status, uint256 decimals)[] result)',
]

class KlerosService {
  provider: Web3Provider
  badgeContract: Contract
  tokensViewContract: Contract
  tcrAddress: string

  constructor(
    badgeContractAddress: string,
    tokensViewContractAddress: string,
    tcrAddress: string,
    provider: Web3Provider,
    signerAddress: Maybe<string>,
  ) {
    this.provider = provider
    this.tcrAddress = tcrAddress

    this.badgeContract = new ethers.Contract(badgeContractAddress, klerosBadgeAbi, provider)
    this.tokensViewContract = new ethers.Contract(
      tokensViewContractAddress,
      klerosTokensViewAbi,
      provider,
    )
    if (signerAddress) {
      const signer = provider.getSigner()
      this.badgeContract = this.badgeContract.connect(signer)
      this.tokensViewContract = this.tokensViewContract.connect(signer)
    }
  }

  /**
   * Return the tokens from the KLEROS TCR already registered
   * @returns {Promise<any[]>}
   */
  queryTokens = async () => {
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
        true, // Include tokens with clearing requests that are not disputed in result.
        false, // Include disputed tokens with registration requests in result.
        true, // Include disputed tokens with clearing requests in result.
        false, // Include tokens submitted by the caller.
        false, // Include tokens challenged by the caller.
      ]

      let hasMore = true
      let addressesWithBadge: string[] = []

      // Fetch addresses of tokens that have the badge.
      // Since the contract returns fixed sized arrays, we must filter out unused items.
      while (hasMore) {
        const result = await this.badgeContract.queryAddresses(
          ethers.constants.AddressZero,
          1000,
          filter,
          true,
        )
        addressesWithBadge = addressesWithBadge.concat(
          result[0].filter((address: string) => address !== ethers.constants.AddressZero),
        )
        hasMore = result.hasMore
      }

      // Fetch their submission IDs on the TCR.
      const submissionIDs = await this.tokensViewContract.getTokensIDsForAddresses(
        this.tcrAddress,
        addressesWithBadge,
      )

      // With the token IDs, get the information and add it to the object.
      const fetchedTokens = await this.tokensViewContract.getTokens(this.tcrAddress, submissionIDs)
      const tokens = fetchedTokens
        .filter((tokenInfo: any) => tokenInfo[3] !== ethers.constants.AddressZero)
        .map(
          (token: any): Token => {
            return {
              symbol: token.ticker,
              address: token.addr,
              decimals: token.decimals.toNumber() || 18, // Token does not implement the 'decimals()' function, falling back to the default, 18 decimal places.
            }
          },
        )

      const basicOrder = ['dai', 'cdai', 'weth', 'usdc', 'owl', 'chai'].reverse()

      return tokens.sort((tokenA: Token, tokenB: Token) => {
        let sortBy: number

        const indexOfA = basicOrder.indexOf(tokenA.symbol.toLowerCase())
        const indexOfB = basicOrder.indexOf(tokenB.symbol.toLowerCase())
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

export { KlerosService }
