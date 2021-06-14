import { utils } from 'ethers'

const alternativeAddresses: { [address: string]: string } = {
  // STAKE token
  '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e': '0x0Ae055097C6d159879521C384F1D2123D1f195e6',
  //weth
  '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  //wbtc
  '0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
}

export function getImageUrl(tokenAddress?: string): string | undefined {
  if (!tokenAddress) return undefined
  tokenAddress = utils.getAddress(tokenAddress)
  const alternativeAddress: any = alternativeAddresses[tokenAddress]
  tokenAddress = alternativeAddress ? alternativeAddress : tokenAddress

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`
}
