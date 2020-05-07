import { CoronaMarketsLogo } from '../components/common/logos/corona_markets'
import { OmenLogo } from '../components/common/logos/omen'

enum Version {
  GNO = 'gno',
  CORONA = 'corona',
  OMEN = 'omen',
}

export const VERSION: Version = process.env.REACT_APP_VERSION as Version
export const IS_CORONA_VERSION = VERSION === Version.CORONA
export const IS_OMEN_VERSION = VERSION === Version.OMEN
export const IS_GNO_VERSION = VERSION === Version.GNO

if ([IS_CORONA_VERSION, IS_OMEN_VERSION, IS_GNO_VERSION].every(v => !v)) {
  throw new Error(`You need to set the REACT_APP_VERSION environment variable to a valid value, got '${VERSION}'`)
}

export const LOGGER_ID: string = process.env.REACT_APP_LOGGER_ID || 'gnosis-conditional-exchange'
export const THREEBOX_ADMIN_ADDRESS: string =
  process.env.REACT_APP_THREEBOX_ADMIN_ADDRESS || '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
export const THREEBOX_SPACE_NAME: string = process.env.REACT_APP_THREEBOX_SPACE_NAME || 'conditional_exchange'
export const GIT_COMMIT: string = process.env.COMMIT_REF || ''
export const INFURA_PROJECT_ID: string = process.env.REACT_APP_INFURA_PROJECT_ID || '7e977d73f2f143ce84ea5ff54f1601fd'
export const REALITIO_TIMEOUT = process.env.REACT_APP_REALITIO_TIMEOUT
export const EARLIEST_MAINNET_BLOCK_TO_CHECK = parseInt(
  process.env.REACT_APP_EARLIEST_MAINNET_BLOCK_TO_CHECK || '9294139',
)
export const EARLIEST_RINKEBY_BLOCK_TO_CHECK = parseInt(
  process.env.REACT_APP_EARLIEST_RINKEBY_BLOCK_TO_CHECK || '6127043',
)
export const FETCH_EVENTS_CHUNK_SIZE = parseInt(process.env.REACT_APP_FETCH_EVENTS_CHUNK_SIZE || '500000', 10)
export const MAX_OUTCOME_ALLOWED = parseInt(process.env.REACT_APP_MAX_OUTCOME_ALLOWED || '4', 10)

export const SINGLE_SELECT_TEMPLATE_ID = 2

export const MARKET_FEE = parseFloat(process.env.REACT_APP_MARKET_FEE || '4.00')

export const CATEGORIES = [
  'Arts',
  'Business & Finance',
  'Cryptocurrency',
  'News & Politics',
  'Science & Tech',
  'Sports',
  'Weather',
  'Miscellaneous',
]

export const GRAPH_MAINNET_HTTP =
  process.env.REACT_APP_GRAPH_MAINNET_HTTP || 'https://api.thegraph.com/subgraphs/name/gnosis/omen'
export const GRAPH_MAINNET_WS =
  process.env.REACT_APP_GRAPH_MAINNET_WS || 'wss://api.thegraph.com/subgraphs/name/gnosis/omen'
export const GRAPH_RINKEBY_HTTP =
  process.env.REACT_APP_GRAPH_RINKEBY_HTTP || 'https://api.thegraph.com/subgraphs/name/gnosis/omen-rinkeby'
export const GRAPH_RINKEBY_WS =
  process.env.REACT_APP_GRAPH_RINKEBY_WS || 'wss://api.thegraph.com/subgraphs/name/gnosis/omen-rinkeby'

export const USE_DISQUS = IS_CORONA_VERSION

const LOGO_MAP: { [K in Version]: any } = {
  corona: CoronaMarketsLogo,
  gno: OmenLogo,
  omen: OmenLogo,
}
export const Logo = LOGO_MAP[VERSION]

const DEFAULT_ARBITRATOR_MAP: { [K in Version]: KnownArbitrator } = {
  corona: 'corona',
  gno: 'realitio',
  omen: 'realitio',
}
export const DEFAULT_ARBITRATOR: KnownArbitrator = DEFAULT_ARBITRATOR_MAP[VERSION]

const DEFAULT_TOKEN_MAP: { [K in Version]: KnownToken } = {
  corona: 'usdc',
  gno: 'gno',
  omen: 'dai',
}
export const DEFAULT_TOKEN = DEFAULT_TOKEN_MAP[VERSION]

export const SHOW_SOCIAL = IS_CORONA_VERSION
export const SHOW_CREATE_MARKET = IS_OMEN_VERSION
export const BLACKLIST_COUNTRIES = IS_CORONA_VERSION
export const ALLOW_CUSTOM_TOKENS = IS_OMEN_VERSION
export const TOGGLEABLE_EXTRA_INFORMATION = !IS_CORONA_VERSION
export const SHOW_MADE_BY = !IS_CORONA_VERSION
export const SHOW_ANSWER_IN_REALITIO = IS_CORONA_VERSION
export const SHOW_POOLING_BTN = !IS_CORONA_VERSION
export const SHOW_FILTERS = IS_CORONA_VERSION || IS_GNO_VERSION || IS_OMEN_VERSION
export const SHOW_CATEGORIES = !IS_CORONA_VERSION
export const SHOW_MY_MARKETS = !IS_CORONA_VERSION
export const SHOW_ADVANCED_FILTERS = !IS_CORONA_VERSION
export const DISABLE_CURRENCY_IN_CREATION = IS_CORONA_VERSION || IS_GNO_VERSION
export const DISABLE_ARBITRATOR_IN_CREATION = IS_CORONA_VERSION || IS_GNO_VERSION
export const WHITELISTED_TEMPLATE_IDS = !IS_CORONA_VERSION
export const SHOW_FOOTER = IS_CORONA_VERSION || IS_GNO_VERSION || IS_OMEN_VERSION
export const WHITELISTED_CREATORS = !IS_OMEN_VERSION

export const MARKET_CREATORS = (process.env.REACT_APP_MARKET_CREATORS || '')
  .split(',')
  .filter(x => x.length)
  .map(x => x.toLowerCase())
if (WHITELISTED_CREATORS && !MARKET_CREATORS.length) {
  throw new Error('You need to set the REACT_APP_MARKET_CREATORS environment variable')
}

export const CORONA_REALITIO_ARBITRATOR: string = process.env.REACT_APP_CORONA_REALITIO_ARBITRATOR || ''
if (IS_CORONA_VERSION && !CORONA_REALITIO_ARBITRATOR) {
  throw new Error('You need to set the REACT_APP_CORONA_REALITIO_ARBITRATOR environment variable')
}

export const DISQUS_SHORTNAME: string = process.env.REACT_APP_DISQUS_SHORTNAME || ''
if (USE_DISQUS && !DISQUS_SHORTNAME) {
  throw new Error('You need to set the REACT_APP_DISQUS_SHORTNAME environment variable')
}

export const DISQUS_URL: string = process.env.REACT_APP_DISQUS_URL || ''
if (USE_DISQUS && !DISQUS_URL) {
  throw new Error('You need to set the REACT_APP_DISQUS_URL environment variable')
}

export const GEO_JS_ENDPOINT = process.env.REACT_APP_GEO_JS_ENDPOINT || 'https://get.geojs.io/v1/ip/geo.js'

export const BLACKLISTED_COUNTRIES = (process.env.REACT_APP_BLACKLISTED_COUNTRIES || '').split(',').filter(Boolean)

export const DOCUMENT_TITLE = process.env.REACT_APP_TITLE || 'Omen'
export const DOCUMENT_DESCRIPTION = process.env.REACT_APP_DESCRIPTION || 'Omen Information Markets'

export const OG_TITLE = process.env.REACT_APP_OG_TITLE || 'Omen Prediction Markets'
export const OG_DESCRIPTION = process.env.REACT_APP_OG_DESCRIPTION || 'Omen Information Markets'
export const OG_IMAGE = process.env.REACT_APP_OG_IMAGE || 'logo_thumbnail.png'
export const OG_URL = process.env.REACT_APP_OG_URL || ''
export const OG_SITE_NAME = process.env.REACT_APP_OG_SITE_NAME || 'Omen'

export const TWITTER_CARD = process.env.REACT_APP_TWITTER_CARD || 'summary_large_image'
export const TWITTER_IMAGE_ALT = process.env.REACT_APP_TWITTER_IMAGE_ALT || 'Omen'
export const TWITTER_SITE = process.env.REACT_APP_TWITTER_SITE || ''

export const LINK_PRIVACY_POLICY = process.env.REACT_APP_LINK_PRIVACY_POLICY || false
export const LINK_TERMS_AND_CONDITIONS = process.env.REACT_APP_LINK_TERMS_AND_CONDITIONS || false
export const LINK_COOKIE_POLICY = process.env.REACT_APP_LINK_COOKIE_POLICY || false
export const LINK_FAQ = process.env.REACT_APP_LINK_FAQ || false
export const DISCLAIMER_TEXT = process.env.REACT_APP_DISCLAIMER_TEXT || false

export const GOOGLE_ANALYTICS_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID || null

export const FETCH_DETAILS_INTERVAL = parseInt(process.env.REACT_APP_FETCH_DETAILS_INTERVAL || '15000', 10)
