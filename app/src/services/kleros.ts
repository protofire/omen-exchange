/* eslint-disable import/no-extraneous-dependencies */
import { abi as arbitratorAbi } from '@kleros/erc-792/build/contracts/IArbitrator.json'
import { abi as gtcrAbi } from '@kleros/tcr/build/contracts/GeneralizedTCR.json'
import axios from 'axios'
import { Contract, ethers } from 'ethers'
import { Web3Provider } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'

import { getGraphUris, getKlerosCurateGraphUris, getTokensByNetwork, networkIds } from '../util/networks'
import { waitABit } from '../util/tools'
import {
  KlerosDisputeOutcome,
  KlerosItemStatus,
  KlerosSubmission,
  MarketCurationState,
  MarketMakerData,
  MarketVerificationState,
  Token,
} from '../util/types'

const klerosBadgeAbi = [
  'function queryAddresses(address _cursor, uint _count, bool[8] _filter, bool _oldestFirst) external view returns (address[] values, bool hasMore)',
]

const klerosTokensViewAbi = [
  'function getTokensIDsForAddresses(address _t2crAddress, address[] _tokenAddresses ) external view returns (bytes32[] result)',
  'function getTokens(address _t2crAddress, bytes32[] _tokenIDs ) external view returns (tuple(bytes32 ID, string name, string ticker, address addr, string symbolMultihash, uint8 status, uint256 decimals)[] result)',
]

interface MetaEvidence {
  fileURI: string
}

interface Request {
  disputed: boolean
  submissionTime: number
  resolved: boolean
  requestType: KlerosItemStatus
  disputeOutcome: KlerosDisputeOutcome
}

interface Item {
  itemID: string
  status: KlerosItemStatus
  requests: Request[]
}

class KlerosService {
  provider: Web3Provider
  badgeContract: Contract | undefined
  tokensViewContract: Contract | undefined
  tcrAddress: string
  omenVerifiedMarkets: Contract
  ipfsGateway: string

  constructor(
    badgeContractAddress: string,
    tokensViewContractAddress: string,
    tcrAddress: string,
    omenVerifiedMarketsAddress: string,
    provider: Web3Provider,
    signerAddress: Maybe<string>,
    ipfsGateway: string,
  ) {
    this.provider = provider
    this.tcrAddress = tcrAddress
    this.ipfsGateway = ipfsGateway
    provider.connection

    const networkId = provider.network ? provider.network.chainId : null
    this.omenVerifiedMarkets = new ethers.Contract(omenVerifiedMarketsAddress, gtcrAbi, provider)

    // eslint-disable-next-line no-warning-comments
    // TODO: remove this conditional when these contracts were deployed to the supported testnets
    if (networkId === networkIds.MAINNET) {
      this.badgeContract = new ethers.Contract(badgeContractAddress, klerosBadgeAbi, provider)
      this.tokensViewContract = new ethers.Contract(tokensViewContractAddress, klerosTokensViewAbi, provider)
      if (signerAddress) {
        const signer = provider.getSigner()
        this.badgeContract = this.badgeContract.connect(signer)
        this.tokensViewContract = this.tokensViewContract.connect(signer)
      }
    }
  }

  /**
   * Return the tokens from the KLEROS TCR already registered
   * @returns {Promise<any[]>}
   */
  queryTokens = async () => {
    const network = await this.provider.getNetwork()
    const networkId = network.chainId

    // eslint-disable-next-line no-warning-comments
    // TODO: remove this check about the contracts, when these contracts were deployed to the supported testnets
    if (networkId !== networkIds.MAINNET || !this.badgeContract || !this.tokensViewContract) {
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
        const result = await this.badgeContract.queryAddresses(ethers.constants.AddressZero, 1000, filter, true)
        addressesWithBadge = addressesWithBadge.concat(
          result[0].filter((address: string) => address !== ethers.constants.AddressZero),
        )
        hasMore = result.hasMore
      }

      // Fetch their submission IDs on the TCR.
      const submissionIDs = await this.tokensViewContract.getTokensIDsForAddresses(this.tcrAddress, addressesWithBadge)

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

  /**
   * Get the total amount of ETH (in wei) required to submit an item.
   *
   * @returns {Promise<BigNumber>} The ETH deposit in wei required to submit an item.
   */
  public async getSubmissionDeposit(): Promise<BigNumber> {
    const [arbitratorAddress, arbitratorExtraData, submissionBaseDeposit] = await Promise.all([
      this.omenVerifiedMarkets.arbitrator(),
      this.omenVerifiedMarkets.arbitratorExtraData(),
      this.omenVerifiedMarkets.submissionBaseDeposit(),
    ])

    const arbitrator = new ethers.Contract(arbitratorAddress, arbitratorAbi, this.provider)
    const arbitrationCost = await arbitrator.arbitrationCost(arbitratorExtraData)

    return submissionBaseDeposit.add(arbitrationCost)
  }

  /**
   * @returns {Promise<BigNumber>} The bounty for successfully challenging a submission.
   */
  public async getSubmissionBaseDeposit(): Promise<BigNumber> {
    return this.omenVerifiedMarkets.submissionBaseDeposit()
  }

  /**
   * @returns {Promise<BigNumber>} The bounty for successfully challenging a removal.
   */
  public async getRemovalBaseDeposit(): Promise<BigNumber> {
    return this.omenVerifiedMarkets.removalBaseDeposit()
  }

  /**
   * Get the total amount of ETH (in wei) required to challenge a submission.
   *
   * @returns {Promise<BigNumber>} The ETH deposit required to challenge a submission.
   */
  public async getSubmissionChallengeDeposit(): Promise<BigNumber> {
    const [arbitratorAddress, arbitratorExtraData, submissionChallengeBaseDeposit] = await Promise.all([
      this.omenVerifiedMarkets.arbitrator(),
      this.omenVerifiedMarkets.arbitratorExtraData(),
      this.omenVerifiedMarkets.submissionChallengeBaseDeposit(),
    ])

    const arbitrator = new ethers.Contract(arbitratorAddress, arbitratorAbi, this.provider)
    const arbitrationCost = await arbitrator.arbitrationCost(arbitratorExtraData)

    return submissionChallengeBaseDeposit.add(arbitrationCost)
  }

  /**
   * @returns {Promise<MetaEvidence[]>} The array with the most recent meta evidence files for this TCR. First item is the meta evidence used for registration requests and the sencod item is the meta evidence used for removal requests.
   */
  public async getLatestMetaEvidence(): Promise<MetaEvidence[]> {
    const logs = (
      await this.provider.getLogs({
        ...this.omenVerifiedMarkets.filters.MetaEvidence(),
        fromBlock: 0,
      })
    ).map(log => this.omenVerifiedMarkets.interface.parseLog(log))

    if (logs.length === 0) throw new Error(`No meta evidence found for TCR at ${this.omenVerifiedMarkets.address}`)

    const metaEvidenceURIs = logs.slice(-2).map(l => l.values._evidence)

    const [registrationMetaEvidenceURI, removalMetaEvidenceURI] = metaEvidenceURIs

    const [registrationMetaEvidence, removalMetaEvidence] = await Promise.all(
      (
        await Promise.all([
          fetch(`${this.ipfsGateway}${registrationMetaEvidenceURI}`),
          fetch(`${this.ipfsGateway}${removalMetaEvidenceURI}`),
        ])
      ).map(response => response.json()),
    )

    return [registrationMetaEvidence, removalMetaEvidence]
  }

  /**
   * @returns {Promise<string>} The URL to the listing criteria.
   */
  public async getListingCriteriaURL(): Promise<string> {
    const [registrationMetaEvidence] = await this.getLatestMetaEvidence()
    return `${this.ipfsGateway}${registrationMetaEvidence.fileURI}`
  }

  /**
   * @returns {Promise<BigNumber>} The duration of the challenge period in seconds.
   */
  public async getChallengePeriodDuration(): Promise<BigNumber> {
    return await this.omenVerifiedMarkets.challengePeriodDuration()
  }

  public async getKlerosGraphMeta() {
    const query = `
      query {
        _meta {
          block {
            hash
            number
          }
        }
      }
    `
    const { chainId: networkId } = await this.provider.getNetwork()
    const { httpUri } = getKlerosCurateGraphUris(networkId)
    const result = await axios.post(httpUri, { query })
    return result.data.data._meta.block
  }

  public async waitForBlockToSync(blockNum: number) {
    let block
    while (!block || block.number < blockNum + 1) {
      block = await this.getKlerosGraphMeta()
      await waitABit()
    }
  }

  /**
   * @returns {Promise<MarketCurationState>} The current verification state of the market.
   * @param marketMakerData The current state of the market.
   */
  public async getMarketState(marketMakerData: MarketMakerData): Promise<MarketCurationState> {
    const query = `
      query fixedProductMarketMaker($id: ID!) {
        fixedProductMarketMaker(id: $id) {
          submissionIDs {
            id
            status
          }
        }
      }
    `

    const variables = {
      id: marketMakerData.address.toLowerCase(),
    }
    const { chainId: networkId } = await this.provider.getNetwork()
    const { httpUri } = getGraphUris(networkId)
    const response = await axios.post(httpUri, { query, variables })
    const { data: responseData } = response || {}
    const { data } = responseData || {}
    const { fixedProductMarketMaker } = data || {}
    const { submissionIDs } = fixedProductMarketMaker || {}
    const submissions: KlerosSubmission[] = submissionIDs ? submissionIDs : []

    if (!submissions || submissions.length === 0)
      return {
        verificationState: MarketVerificationState.NotVerified,
      }

    const fullSubmissions: Item[] = (
      await Promise.all(
        submissions.map(async submission => {
          const variables = {
            id: `${submission.id}@${this.omenVerifiedMarkets.address.toLowerCase()}`,
          }
          const query = `query item($id: ID!) {
          item(id: $id) {
            itemID
            status
            requests {
              disputed
              submissionTime
              resolved
              requestType
              disputeOutcome
            }
          }
        }
        `
          const { httpUri } = getKlerosCurateGraphUris(networkId)

          return await axios.post(httpUri, { query, variables })
        }),
      )
    )
      .filter(d => d && d.data && d.data.data && d.data.data.item)
      .map(d => d.data.data.item as Item)
      .map(i => {
        i.requests = i.requests.map(r => ({ ...r, submissionTime: Number(r.submissionTime) }))
        return i
      })
      .sort((i1, i2) => {
        // Sort by item with the most recent request.
        const { submissionTime: i1SubmissionTime } = i1.requests
          .sort((r1, r2) => r1.submissionTime - r2.submissionTime)
          .slice(-1)[0]
        const { submissionTime: i2SubmissionTime } = i2.requests
          .sort((r1, r2) => r1.submissionTime - r2.submissionTime)
          .slice(-1)[0]
        return i1SubmissionTime - i2SubmissionTime
      })

    for (const item of fullSubmissions) {
      const { itemID } = item
      const { disputeOutcome, disputed, requestType, resolved, submissionTime } = item.requests
        .sort((r1, r2) => r1.submissionTime - r2.submissionTime)
        .slice(-1)[0]
      if (!disputed) {
        if (resolved) {
          return {
            verificationState:
              requestType === KlerosItemStatus.RegistrationRequested
                ? MarketVerificationState.Verified
                : MarketVerificationState.NotVerified,
            submissionTime,
            itemID,
          }
        } else {
          return {
            verificationState:
              requestType === KlerosItemStatus.RegistrationRequested
                ? MarketVerificationState.SubmissionChallengeable
                : MarketVerificationState.RemovalChallengeable,
            submissionTime,
            itemID,
          }
        }
      }

      if (!resolved) {
        return {
          verificationState: MarketVerificationState.WaitingArbitration,
          submissionTime,
          itemID,
        }
      } else {
        let verificationState = MarketVerificationState.Verified
        if (disputeOutcome === KlerosDisputeOutcome.Accept) {
          if (requestType === KlerosItemStatus.ClearingRequested)
            verificationState = MarketVerificationState.NotVerified
        } else if (disputeOutcome === KlerosDisputeOutcome.Refuse) {
          if (requestType === KlerosItemStatus.RegistrationRequested)
            verificationState = MarketVerificationState.NotVerified
        } else {
          // Refuse to rule returns item to the previous state.
          if (requestType === KlerosItemStatus.RegistrationRequested)
            verificationState = MarketVerificationState.NotVerified
        }
        return {
          verificationState,
          submissionTime,
          itemID,
        }
      }
    }

    return {
      verificationState: MarketVerificationState.NotVerified,
    }
  }
}

export { KlerosService }
