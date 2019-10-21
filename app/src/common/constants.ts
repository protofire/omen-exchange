import { ethers } from 'ethers'

export const CONNECTOR: string = process.env.REACT_APP_CONNECTOR || 'MetaMask'
export const FEE = ethers.utils.parseEther('0.01') // 1%
export const LOGGER_ID: string = process.env.REACT_APP_LOGGER_ID || 'gnosis-conditional-exchange'
export const THREEBOX_ADMIN_ADDRESS: string =
  process.env.REACT_APP_THREEBOX_ADMIN_ADDRESS || '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
export const THREEBOX_SPACE_NAME: string =
  process.env.REACT_APP_THREEBOX_SPACE_NAME || 'conditional_exchange'
