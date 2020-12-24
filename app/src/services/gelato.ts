import {
  Action as GelatoAction,
  Condition as GelatoCondition,
  GelatoProvider,
  Operation,
  Task,
  TaskReceipt,
} from '@gelatonetwork/core'
import { Contract, Wallet, constants, ethers, utils } from 'ethers'

import { GELATO_MIN_USD_THRESH } from '../common/constants'
import { getLogger } from '../util/logger'
import { getToken } from '../util/networks'
import { GelatoData } from '../util/types'

const logger = getLogger('Services::GelatoService')

const gelatoCoreAbi = [
  'function submitTask(tuple(address addr, address module) _provider, tuple(tuple(address inst, bytes data)[] conditions, tuple(address addr, bytes data, uint8 operation, uint8 dataFlow, uint256 value, bool termsOkCheck)[] actions, uint256 selfProviderGasLimit, uint256 selfProviderGasPriceCeil) _task, uint256 _expiryDate)',
  'function cancelTask(tuple(uint256 id, address userProxy, tuple(address addr, address module) provider, uint256 index, tuple(tuple(address inst, bytes data)[] conditions, tuple(address addr, bytes data, uint8 operation, uint8 dataFlow, uint256 value, bool termsOkCheck)[] actions, uint256 selfProviderGasLimit, uint256 selfProviderGasPriceCeil)[] tasks, uint256 expiryDate, uint256 cycleId, uint256 submissionsLeft) _TR)',
]

const actionWithdrawLiquidutyAbi = [
  'function action(address _conditionalTokens, address _fixedProductMarketMaker, uint256[] _positionIds, bytes32 _conditionId, bytes32 _parentCollectionId, address _collateralToken, address _receiver)',
]

const gnosisSafeAbi = [
  'function enableModule(address module) public',
  'function getModules() public view returns (address[])',
]

// Uniswap token prices
const uniswapV2FactoryAbi = ['function getPair(address,address) view returns (address pair)']
const uniswapV2PairAbi = [
  'function getReserves() view returns (uint112, uint112, uint32)',
  'function token0() view returns (address)',
]
const uniswapV2FactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'

interface NetworkContracts {
  gelatoCore: string
  gelatoProvider: string
  providerModuleGnosisSafe: string
  conditionTime: string
  actionWithdrawLiquidity: string
}

interface GelatoContracts {
  abis: {
    gelatoCore: string[]
    actionWithdrawLiquidity: string[]
    gnosisSafe: string[]
  }
  addresses: {
    rinkeby: NetworkContracts
    mainnet: NetworkContracts
  }
}

interface SubmitTimeBasedWithdrawalData {
  gelatoData: GelatoData
  conditionalTokensAddress: string
  fpmmAddress: string
  positionIds: number[]
  conditionId: string
  collateralTokenAddress: string
  receiver: string
}

interface UniToken {
  address: string
  decimals: number
}

const gelatoContracts: GelatoContracts = {
  abis: {
    gelatoCore: gelatoCoreAbi,
    actionWithdrawLiquidity: actionWithdrawLiquidutyAbi,
    gnosisSafe: gnosisSafeAbi,
  },
  addresses: {
    rinkeby: {
      gelatoCore: '0x733aDEf4f8346FD96107d8d6605eA9ab5645d632',
      gelatoProvider: '0x01056a4A95a88035af4fC9fD9fD4d4563dd284C3',
      providerModuleGnosisSafe: '0x28ec977614E3cA9Ac4a5A48f44e8BDD9232ba21f',
      conditionTime: '0xC92Bc7c905d52B4bC4d60719a8Bce3B643d77daF',
      actionWithdrawLiquidity: '0x101F34DD8B3B831E1579D5Cb62221bbdA11186A2',
    },
    mainnet: {
      gelatoCore: '0x025030bdaa159f281cae63873e68313a703725a5',
      gelatoProvider: '0x3d9A46b5D421bb097AC28B4f70a4A1441A12920C',
      providerModuleGnosisSafe: '0x2E87AD9BBdaa9113cd5cA1920c624E2749D7086B',
      conditionTime: '0x63129681c487d231aa9148e1e21837165f38deaf',
      actionWithdrawLiquidity: '0x301E130DAA16B2F8FAeB21E1a328EAB0d606AC12',
    },
  },
}

const getUniswapPrice = async (tokenA: UniToken, tokenB: UniToken, provider: any): Promise<number> => {
  const factoryContract = new Contract(uniswapV2FactoryAddress, uniswapV2FactoryAbi, provider)
  const pairAddress = factoryContract.getPair(tokenA.address, tokenB.address)
  if (pairAddress == constants.AddressZero) {
    throw Error('pair does not exist')
  }
  const pairContract = new Contract(pairAddress, uniswapV2PairAbi, provider)
  const [reserves0, reserves1] = await pairContract.getReserves()
  const token0 = await pairContract.token0()
  const balances =
    utils.getAddress(tokenA.address) === utils.getAddress(token0) ? [reserves0, reserves1] : [reserves1, reserves0]
  const decimalCoeff = 10 ** tokenA.decimals / 10 ** tokenB.decimals
  return Number(decimalCoeff * (balances[1] / balances[0]))
}

interface SubmitTimeBasedWithdrawalData {
  gelatoData: GelatoData
  conditionalTokensAddress: string
  fpmmAddress: string
  positionIds: number[]
  conditionId: string
  collateralTokenAddress: string
  receiver: string
}

class GelatoService {
  provider: any
  signer: any
  networkId: number
  dai: any
  weth: any
  addresses: NetworkContracts

  constructor(provider: any, signerAddress: Maybe<string>, networkId: number) {
    this.provider = provider
    this.networkId = networkId
    this.dai = getToken(this.networkId, 'dai')
    this.weth = getToken(this.networkId, 'weth')
    if (networkId == 1) {
      this.addresses = gelatoContracts.addresses.mainnet
    } else if (networkId == 4) {
      this.addresses = gelatoContracts.addresses.rinkeby
    } else {
      throw Error(`Unknown networkId: ${networkId}`)
    }
    this.signer = null
    if (signerAddress) {
      const mySigner: Wallet = provider.getSigner()
      this.signer = mySigner
    }
  }

  /**
   * Encode Auto Withdraw Task Submission
   */
  encodeSubmitTimeBasedWithdrawalTask = async (taskData: SubmitTimeBasedWithdrawalData): Promise<string> => {
    if (taskData.gelatoData.inputs === null) throw Error('Need Date')

    const gelatoCoreInterface = new utils.Interface(gelatoCoreAbi)

    const gelatoProvider = new GelatoProvider({
      addr: this.addresses.gelatoProvider,
      module: this.addresses.providerModuleGnosisSafe,
    })

    const timestamp = Date.parse(taskData.gelatoData.inputs.toString()) / 1000

    const condition = new GelatoCondition({
      inst: this.addresses.conditionTime,
      data: utils.defaultAbiCoder.encode(['uint'], [timestamp]),
    })

    const actionWithdrawLiquidityInterface = new utils.Interface(actionWithdrawLiquidutyAbi)

    const actionWithdrawLiquidityData = actionWithdrawLiquidityInterface.functions.action.encode([
      taskData.conditionalTokensAddress,
      taskData.fpmmAddress,
      taskData.positionIds,
      taskData.conditionId,
      constants.HashZero,
      taskData.collateralTokenAddress,
      taskData.receiver,
    ])

    const action = new GelatoAction({
      addr: this.addresses.actionWithdrawLiquidity,
      data: actionWithdrawLiquidityData,
      operation: Operation.Delegatecall,
    })

    const task = new Task({
      conditions: [condition],
      actions: [action],
    })

    const expiryDate = 0 // Not expiring

    return gelatoCoreInterface.functions.submitTask.encode([gelatoProvider, task, expiryDate])
  }

  /**
   * Cancel pending automated withdrawal task
   */
  encodeCancelTask = (taskReceipt: TaskReceipt): string => {
    const gelatoCoreInterface = new utils.Interface(gelatoCoreAbi)
    return gelatoCoreInterface.functions.cancelTask.encode([taskReceipt])
  }

  /**
   * Whitelist GelatoCore as Module
   */
  encodeWhitelistGelatoAsModule = async (): Promise<string> => {
    const gnosisSafeInterface = new utils.Interface(gnosisSafeAbi)
    return gnosisSafeInterface.functions.enableModule.encode([this.addresses.gelatoCore])
  }

  /**
   * Decode Action Data
   */
  decodeSubmitTimeBasedWithdrawalTask = async (hexData: string): Promise<any> => {
    const data = utils.defaultAbiCoder.decode(
      ['address', 'address', 'uint256[]', 'bytes32', 'bytes32', 'address', 'address'],
      utils.hexDataSlice(hexData, 4),
    )
    return data
  }

  /**
   * Decode Condition Data
   */
  decodeTimeConditionData = async (hexData: string): Promise<any> => {
    const data = utils.defaultAbiCoder.decode(['uint256'], hexData)
    return data
  }

  /**
   * Check if Gnosis Safe whitelisted Gelato Core as a module
   */
  isGelatoWhitelistedModule = async (safeAddress: string): Promise<boolean> => {
    try {
      const gnosisSafe = new ethers.Contract(safeAddress, gnosisSafeAbi, this.provider)
      const modules = await gnosisSafe.getModules()
      let isModule = false
      modules.forEach((module: string) => {
        if (utils.getAddress(module) === utils.getAddress(this.addresses.gelatoCore)) isModule = true
      })
      return isModule
    } catch {
      return false
    }
  }

  /**
   * Returns min collateral amount to schedule auto withdraw
   */
  minimumTokenAmount = async (tokenAddress: string, tokenDecimals: number): Promise<number> => {
    try {
      const price = await this.findTokenUsdPrice(tokenAddress, tokenDecimals)
      return GELATO_MIN_USD_THRESH / price
    } catch (err) {
      logger.error(`error finding price via uniswap: ${err.message}`)
      throw new Error(`error finding price via uniswap`)
    }
  }

  /**
   * Returns Uniswap price of collateral to DAI
   */
  findTokenUsdPrice = async (address: string, decimals: number): Promise<number> => {
    const token: UniToken = {
      address: address,
      decimals: decimals,
    }

    // assumes collateral token will always have uniswap pair with either DAI or ETH
    try {
      return await getUniswapPrice(token, this.dai, this.provider)
    } catch {
      const ethUsdPrice = await getUniswapPrice(this.weth, this.dai, this.provider)
      const tokenEthPrice = await getUniswapPrice(token, this.weth, this.provider)
      return ethUsdPrice * tokenEthPrice
    }
  }
}

export { GelatoService }
