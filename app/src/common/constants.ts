export const LOGGER_ID: string = process.env.REACT_APP_LOGGER_ID || 'gnosis-conditional-exchange'
export const THREEBOX_ADMIN_ADDRESS: string =
  process.env.REACT_APP_THREEBOX_ADMIN_ADDRESS || '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
export const THREEBOX_SPACE_NAME: string = process.env.REACT_APP_THREEBOX_SPACE_NAME || 'conditional_exchange'
export const GIT_COMMIT: string = process.env.COMMIT_REF || ''
export const INFURA_PROJECT_ID: string = process.env.REACT_APP_INFURA_PROJECT_ID || '7e977d73f2f143ce84ea5ff54f1601fd'
export const REALITIO_TIMEOUT = process.env.REACT_APP_REALITIO_TIMEOUT
export const EARLIEST_MAINNET_BLOCK_TO_CHECK = process.env.REACT_APP_EARLIEST_MAINNET_BLOCK_TO_CHECK
export const EARLIEST_RINKEBY_BLOCK_TO_CHECK = process.env.REACT_APP_EARLIEST_RINKEBY_BLOCK_TO_CHECK
export const EARLIEST_GANACHE_BLOCK_TO_CHECK = process.env.REACT_APP_EARLIEST_GANACHE_BLOCK_TO_CHECK
export const FETCH_EVENTS_CHUNK_SIZE = parseInt(process.env.REACT_APP_FETCH_EVENTS_CHUNK_SIZE || '500000', 10)
export const MAX_OUTCOME_ALLOWED = parseInt(process.env.REACT_APP_MAX_OUTCOME_ALLOWED || '4', 10)

export const SINGLE_SELECT_TEMPLATE_ID = 2

export const MARKET_FEE = parseFloat(process.env.REACT_APP_MARKET_FEE || '4.00')
