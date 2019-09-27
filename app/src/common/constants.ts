import { ethers } from 'ethers'

export const CONNECTOR: string = process.env.REACT_APP_CONNECTOR || 'MetaMask'
export const FEE = ethers.utils.parseEther('0.01') // 1%
export const LOGGER_ID: string = process.env.REACT_APP_LOGGER_ID || 'gnosis-conditional-exchange'
