import { ethers } from 'ethers'

export const CONNECTOR: string = process.env.REACT_APP_CONNECTOR || 'MetaMask'
// Must be 0.1
export const FEE = ethers.utils.parseEther('0.1')
