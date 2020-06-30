import { utils } from 'ethers'

export function getImageUrl(tokenAddress?: string): string | undefined {
  if (!tokenAddress) return undefined
  tokenAddress = utils.getAddress(tokenAddress)
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`
}
