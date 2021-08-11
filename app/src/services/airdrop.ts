import { Contract, Wallet, ethers, utils } from 'ethers'
import { BigNumber } from 'ethers/utils'

import airdropAbi from '../abi/airdrop.json'
import { Transaction } from '../util/cpk'
import { getAirdrops } from '../util/networks'

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

  getClaims = async (recipient: Maybe<string>) => {
    if (this.airdrops) {
      const claims = await Promise.all(
        this.airdrops.map(async (airdrop, index) => {
          try {
            const response = await fetch(
              `https://raw.githubusercontent.com/hexyls/omen-airdrop/master/${index + 1}/${recipient}.json`,
            )
            const claim = await response.json()
            if (claim && claim.amount) {
              try {
                const claimed = await airdrop.isClaimed(claim.index)

                if (!claimed) {
                  return { ...claim, airdrop: airdrop.address, recipient }
                }
                // eslint-disable-next-line
              } catch {}
            }
            // eslint-disable-next-line
          } catch {}
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

  encodeClaims = async (address: string): Promise<Transaction[] | undefined> => {
    if (this.airdrops) {
      const claims = await this.getClaims(address)
      if (claims && claims.length > 0) {
        return claims.map(claim => {
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
  }
}

export { AirdropService }
