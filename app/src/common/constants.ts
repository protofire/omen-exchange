import { ethers } from 'ethers'

export const CONNECTOR: string = process.env.REACT_APP_CONNECTOR || 'MetaMask'
// Must be 0.1
export const FEE = ethers.utils.parseEther('0.1')
export const LOGGER_ID: string = process.env.REACT_APP_LOGGER_ID || 'gnosis-conditional-exchange'
export const APP_URL: string = process.env.REACT_APP_URL || 'http://localhost:3000/'
