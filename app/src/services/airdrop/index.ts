import { Contract, Wallet, ethers, utils } from 'ethers'
import { BigNumber, getAddress } from 'ethers/utils'

import { Transaction, calcRelayProxyAddress } from '../../util/cpk'
import { getAirdrops, networkIds } from '../../util/networks'
import { isAddress } from '../../util/tools'

import { airdropAbi } from './abi'

class AirdropService {
  airdrops?: Contract[]
  provider: any

  constructor(networkId: number, provider: any, signerAddress: Maybe<string>) {
    const signer: Wallet = provider.getSigner()
    this.provider = provider

    const airdrops = getAirdrops(networkId)
    if (airdrops && airdrops.length && signerAddress) {
      this.airdrops = airdrops.map(airdrop => new ethers.Contract(airdrop, airdropAbi, provider).connect(signer))
    }
  }

  static getClaim = async (airdrop: string, address: Maybe<string>, networkId: number, provider: any) => {
    // handle / format address
    const lowerCaseAddress = address && address.toLowerCase()
    const recipient = lowerCaseAddress && isAddress(lowerCaseAddress) && getAddress(lowerCaseAddress)
    // eslint-disable-next-line
    const proofs = require(`./${airdrop}.json`)
    if (recipient) {
      if (networkId === networkIds.XDAI) {
        const proxyAddress = calcRelayProxyAddress(recipient, provider)
        const proxyClaim = proxyAddress && proofs.claims[proxyAddress]
        if (proxyClaim) {
          return { ...proxyClaim, recipient: proxyAddress }
        }
      }
      return { ...proofs.claims[recipient], recipient }
    }
  }

  getClaims = async (address: Maybe<string>) => {
    if (this.airdrops) {
      const network = await this.provider.getNetwork()
      const claims = await Promise.all(
        this.airdrops.map(async airdrop => {
          const claim = await AirdropService.getClaim(airdrop.address, address, network.chainId, this.provider)
          if (claim && claim.amount) {
            const claimed = await airdrop.isClaimed(claim.index)
            if (!claimed) {
              return { ...claim, airdrop: airdrop.address }
            }
          }
        }),
      )
      return claims.filter(claim => claim)
    }
  }

  getClaimAmount = async (address: Maybe<string>) => {
    const amount = new BigNumber('0')
    if (this.airdrops) {
      // get claims across all airdrops
      const claims = await this.getClaims(address)
      // aggregate claim amounts
      return claims?.reduce((totalAmount, claim) => {
        if (claim) {
          return totalAmount.add(new BigNumber(claim.amount))
        }
        return totalAmount
      }, amount)
    }
    return amount
  }

  encodeClaims = async (address: string): Promise<Transaction[]> => {
    const transactions: Transaction[] = []
    if (this.airdrops) {
      const claims = await this.getClaims(address)
      if (claims) {
        return claims?.map(claim => {
          const airdropInterface = new utils.Interface(airdropAbi)
          const data = airdropInterface.functions.claim.encode([
            claim.index,
            claim.recipient,
            claim.amount,
            claim.proof,
          ])
          return {
            to: claim.airdrop,
            data,
          }
        })
      }
    }
    return transactions
  }
}

export { AirdropService }
