import { utils } from 'ethers'

type HasAlternativeAddress = '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e'

const alternativeAddresses: { [A in HasAlternativeAddress]: string } = {
  // STAKE token
  '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e': '0x0Ae055097C6d159879521C384F1D2123D1f195e6',
}

export function getImageUrl(tokenAddress?: string): string | undefined {
  if (!tokenAddress) return undefined
  tokenAddress = utils.getAddress(tokenAddress)
  const alternativeAddress = alternativeAddresses[tokenAddress as HasAlternativeAddress]
  tokenAddress = alternativeAddress ? alternativeAddress : tokenAddress
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`
}
