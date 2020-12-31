import { OmenLogo } from '../components/common/logos/omen'

export const LOGGER_ID = 'gnosis-conditional-exchange'
export const THREEBOX_ADMIN_ADDRESS = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
export const THREEBOX_SPACE_NAME = 'conditional_exchange'
export const INFURA_PROJECT_ID = '9c6788bb15234036991db4637638429f'
export const REALITIO_TIMEOUT = 86400
export const EARLIEST_MAINNET_BLOCK_TO_CHECK = parseInt('9294139')
export const EARLIEST_RINKEBY_BLOCK_TO_CHECK = parseInt('6127043')
export const FETCH_EVENTS_CHUNK_SIZE = parseInt('500000', 10)

const MAX_OUTCOMES = parseInt('8', 10)
export const MAX_OUTCOME_ALLOWED = MAX_OUTCOMES > 256 ? 256 : MAX_OUTCOMES

export const UINT_TEMPLATE_ID = 1
export const SINGLE_SELECT_TEMPLATE_ID = 2

export const MARKET_FEE = parseFloat('2.00')
export const MAX_MARKET_FEE = parseFloat('5.00')

export const CATEGORIES = [
  'Business & Finance',
  'Cryptocurrency',
  'News & Politics',
  'Science & Tech',
  'Sports',
  'Weather',
  'Miscellaneous',
]

export const TRADING_FEE_OPTIONS = [
  '0.00',
  '0.25',
  '0.50',
  '0.75',
  '1.00',
  '1.25',
  '1.50',
  '1.75',
  '2.00',
  '2.25',
  '2.50',
  '2.75',
  '3.00',
  '3.25',
  '3.50',
  '3.75',
  '4.00',
  '4.25',
  '4.50',
  '4.75',
  '5.00',
]

export const GRAPH_MAINNET_HTTP = 'https://api.thegraph.com/subgraphs/name/protofire/omen'
export const GRAPH_MAINNET_WS = 'wss://api.thegraph.com/subgraphs/name/protofire/omen'
export const GRAPH_RINKEBY_HTTP = 'https://api.thegraph.com/subgraphs/name/protofire/omen-rinkeby'
export const GRAPH_RINKEBY_WS = 'wss://api.thegraph.com/subgraphs/name/protofire/omen-rinkeby'
export const GRAPH_SOKOL_HTTP = 'https://api.thegraph.com/subgraphs/name/protofire/omen-sokol'
export const GRAPH_SOKOL_WS = 'wss://api.thegraph.com/subgraphs/name/protofire/omen-sokol'

export const KLEROS_CURATE_GRAPH_MAINNET_HTTP = 'https://api.thegraph.com/subgraphs/name/kleros/curate'
export const KLEROS_CURATE_GRAPH_MAINNET_WS = 'wss://api.thegraph.com/subgraphs/name/kleros/curate'
export const KLEROS_CURATE_GRAPH_RINKEBY_HTTP = 'https://api.thegraph.com/subgraphs/name/kleros/curate-rinkeby'
export const KLEROS_CURATE_GRAPH_RINKEBY_WS = 'wss://api.thegraph.com/subgraphs/name/kleros/curate-rinkeby'

export const IPFS_GATEWAY = 'https://ipfs.kleros.io'

export const Logo = OmenLogo

export const DEFAULT_ARBITRATOR: KnownArbitrator = 'kleros'

export const DEFAULT_TOKEN = 'dai'

export const DOCUMENT_TITLE = 'Omen'
export const DOCUMENT_DESCRIPTION = 'Omen Information Markets'

export const DOCUMENT_VALIDITY_RULES = './rules.pdf'
export const DOCUMENT_FAQ = './faq.pdf'

export const OG_TITLE = 'Omen Prediction Markets'
export const OG_DESCRIPTION = 'Omen Information Markets'
export const OG_IMAGE = 'omen_logo_thumbnail.png'
export const OG_URL = 'https://omen.eth.link/'
export const OG_SITE_NAME = 'Omen'

export const TWITTER_CARD = 'summary_large_image'
export const TWITTER_IMAGE_ALT = 'Omen'
export const TWITTER_SITE = '@Omen_eth'

export const DISCLAIMER_TEXT = ''

export const FETCH_DETAILS_INTERVAL = parseInt('15000', 10)
export const SHOW_FOOTER = true
export const IMPORT_QUESTION_ID_KEY = 'importQuestionId'

export const DEFAULT_TOKEN_ADDRESS_RINKEBY = '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea'
export const DEFAULT_TOKEN_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'

export const REALITIO_PROXY_ADDRESS = '0x0e414d014A77971f4EAA22AB58E6d84D16Ea838E'
export const REALITIO_PROXY_ADDRESS_RINKEBY = '0x17174dC1b62add32a1DE477A357e75b0dcDEed6E'
export const REALITIO_SCALAR_ADAPTER_ADDRESS = '0xaa548EfBb0972e0c4b9551dcCfb6B787A1B90082'
export const REALITIO_SCALAR_ADAPTER_ADDRESS_RINKEBY = '0x0e8Db8caD541C0Bf5b611636e81fEc0828bc7902'
