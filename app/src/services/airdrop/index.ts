import { Contract, Wallet, ethers, utils } from 'ethers'
import { BigNumber, getAddress } from 'ethers/utils'

import { calcRelayProxyAddress } from '../../util/cpk'
import { getAirdropAddress, networkIds } from '../../util/networks'
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

class AirdropService {
  contract?: Contract
  provider: any

  constructor(networkId: number, provider: any) {
    const signer: Wallet = provider.getSigner()
    this.provider = provider

    const contractAddress = getAirdropAddress(networkId)
    if (contractAddress) {
      this.contract = new ethers.Contract(contractAddress, airdropAbi, provider).connect(signer)
    }
  }

  static getClaim = (address: Maybe<string>, networkId: number, provider: any) => {
    let claim
    // handle / format address
    const lowerCaseAddress = address && address.toLowerCase()
    const claimAddress = lowerCaseAddress && isAddress(lowerCaseAddress) && getAddress(lowerCaseAddress)
    if (claimAddress) {
      if (provider.relay) {
        const proxyAddress = calcRelayProxyAddress(claimAddress, provider)
        if (proxyAddress) {
          claim = xdaiProofs.claims[proxyAddress]
        }
      } else if (networkId === networkIds.MAINNET || networkId === networkIds.RINKEBY) {
        claim = mainnetProofs.claims[claimAddress]
      } else if (networkId === networkIds.XDAI) {
        claim = xdaiProofs.claims[claimAddress]
      }
    }
    return claim
  }

  getClaimAmount = async (address: Maybe<string>) => {
    const network = await this.provider.getNetwork()
    const claim = AirdropService.getClaim(address, network.chainId, this.provider)
    if (claim && this.contract) {
      const claimed = await this.contract.isClaimed(claim.index)
      if (!claimed) {
        return new BigNumber(claim.amount)
      }
    }
    return new BigNumber('0')
  }

  static encodeClaimAirdrop = (address: string, networkId: number, provider: any): string | undefined => {
    const claim = AirdropService.getClaim(address, networkId, provider)
    if (claim) {
      const airdropInterface = new utils.Interface(airdropAbi)
      return airdropInterface.functions.claim.encode([claim.index, address, claim.amount, claim.proof])
    }
  }

  claimAidrop = async (address: string) => {
    const network = await this.provider.getNetwork()
    const claim = AirdropService.getClaim(address, network.chainId, this.provider)
    if (claim && this.contract) {
      return this.contract.claim(claim.index, address, claim.amount, claim.proof)
    }
  }
}

export { AirdropService }
