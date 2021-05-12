import { utils } from 'ethers'
import { BigNumber, getAddress } from 'ethers/utils'

import { calcRelayProxyAddress } from '../../util/cpk'
import { networkIds } from '../../util/networks'
import { isAddress } from '../../util/tools'

import { airdropAbi } from './abi'
import mainnetData from './mainnetProofs.json'
import xdaiData from './xdaiProofs.json'

interface Claim {
  index: number
  amount: string
  proof: [string]
}

interface Proofs {
  claims: {
    [K in string]?: Claim
  }
}

const xdaiProofs = (xdaiData as unknown) as Proofs
const mainnetProofs = (mainnetData as unknown) as Proofs

class Airdrop {
  static getClaim = (address: Maybe<string>, networkId: number, relay: boolean, provider: any) => {
    let claim
    // handle / format address
    const lowerCaseAddress = address && address.toLowerCase()
    const claimAddress = lowerCaseAddress && isAddress(lowerCaseAddress) && getAddress(lowerCaseAddress)
    if (claimAddress) {
      if (relay) {
        const proxyAddress = calcRelayProxyAddress(claimAddress, provider)
        if (proxyAddress) {
          claim = xdaiProofs.claims[proxyAddress]
        }
      } else if (networkId === networkIds.MAINNET) {
        claim = mainnetProofs.claims[claimAddress]
      } else if (networkId === networkIds.XDAI) {
        claim = xdaiProofs.claims[claimAddress]
      }
    }
    return claim
  }

  static getClaimAmount = (address: Maybe<string>, networkId: number, relay: boolean, provider: any) => {
    const claim = Airdrop.getClaim(address, networkId, relay, provider)
    return new BigNumber(claim ? claim.amount : '0')
  }

  static encodeClaimAirdrop = (
    address: string,
    networkId: number,
    relay: boolean,
    provider: any,
  ): string | undefined => {
    const claim = Airdrop.getClaim(address, networkId, relay, provider)
    if (claim) {
      const airdropInterface = new utils.Interface(airdropAbi)
      return airdropInterface.functions.claim.encode([claim.index, address, claim.amount, claim.proof])
    }
  }
}

export { Airdrop }
