import { Contract, Wallet, ethers, utils } from 'ethers'
import { TransactionReceipt } from 'ethers/providers'
import { BigNumber, BigNumberish } from 'ethers/utils'

import { getLogger } from '../util/logger'
import { getEarliestBlockToCheck } from '../util/networks'
import { getIndexSets } from '../util/tools'

const logger = getLogger('Services::Conditional-Token')

const conditionalTokensAbi = [
  'function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external',
  'event ConditionPreparation(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint outcomeSlotCount)',
  'function setApprovalForAll(address operator, bool approved) external',
  'function isApprovedForAll(address owner, address operator) external view returns (bool)',
  'function payoutNumerators(bytes32, uint) public view returns (uint)',
  'function payoutDenominator(bytes32) public view returns (uint)',
  'function redeemPositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] indexSets) external',
  'function getCollectionId(bytes32 parentCollectionId, bytes32 conditionId, uint indexSet) external view returns (bytes32) ',
  'function getPositionId(address collateralToken, bytes32 collectionId) external pure returns (uint) ',
  'function balanceOf(address owner, uint256 positionId) external view returns (uint256)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes data) external',
  'function getOutcomeSlotCount(bytes32 conditionId) external view returns (uint)',
  'function mergePositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] partition, uint amount) external',
]

class ConditionalTokenService {
  contract: Contract
  signerAddress: Maybe<string>
  provider: any

  constructor(address: string, provider: any, signerAddress: Maybe<string>) {
    if (signerAddress) {
      const signer: Wallet = provider.getSigner()
      this.contract = new ethers.Contract(address, conditionalTokensAbi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(address, conditionalTokensAbi, provider)
    }
    this.signerAddress = signerAddress
    this.provider = provider
  }

  get address(): string {
    return this.contract.address
  }

  prepareCondition = async (questionId: string, oracleAddress: string, outcomeSlotCount = 2): Promise<string> => {
    const transactionObject = await this.contract.prepareCondition(
      oracleAddress,
      questionId,
      new BigNumber(outcomeSlotCount),
      {
        value: '0x0',
        gasLimit: 750000,
      },
    )
    logger.log(`Prepare condition transaction hash: ${transactionObject.hash}`)
    await this.provider.waitForTransaction(transactionObject.hash)

    const conditionId = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint256'],
      [oracleAddress, questionId, outcomeSlotCount],
    )

    return conditionId
  }

  getCollectionIdForOutcome = async (conditionId: string, outcomeIndex: number): Promise<any> => {
    return this.contract.getCollectionId(ethers.constants.HashZero, conditionId, outcomeIndex)
  }

  getPositionId = async (collateralAddress: string, collectionId: string): Promise<any> => {
    return this.contract.getPositionId(collateralAddress, collectionId)
  }

  getBalanceOf = async (ownerAddress: string, positionId: string): Promise<BigNumber> => {
    return this.contract.balanceOf(ownerAddress, positionId)
  }
  getBalanceOfByBlock = async (ownerAddress: string, positionId: string, block: number): Promise<BigNumber> => {
    return this.contract.balanceOf(ownerAddress, positionId, { blockTag: block })
  }

  getQuestionId = async (conditionId: string): Promise<string> => {
    const filter: any = this.contract.filters.ConditionPreparation(conditionId)

    const network = await this.provider.getNetwork()
    const networkId = network.chainId

    const logs = await this.provider.getLogs({
      ...filter,
      fromBlock: getEarliestBlockToCheck(networkId),
      toBlock: 'latest',
    })

    if (logs.length === 0) {
      throw new Error(`No ConditionPreparation event found for conditionId '${conditionId}'`)
    }
    if (logs.length > 1) {
      logger.warn(`There should be only one ConditionPreparation event for conditionId '${conditionId}'`)
    }

    const iface = new ethers.utils.Interface(conditionalTokensAbi)
    const event = iface.parseLog(logs[0])

    return event.values.questionId
  }

  setApprovalForAll = async (spender: string): Promise<TransactionReceipt> => {
    const transactionObject = await this.contract.setApprovalForAll(spender, true)
    return this.provider.waitForTransaction(transactionObject.hash)
  }

  isApprovedForAll = async (owner: string, spender: string): Promise<boolean> => {
    return this.contract.isApprovedForAll(owner, spender)
  }

  isConditionResolved = async (conditionId: string): Promise<boolean> => {
    const payoutDenominator: BigNumber = await this.contract.payoutDenominator(conditionId)

    return !payoutDenominator.isZero()
  }

  redeemPositions = async (
    collateralToken: string,
    conditionId: string,
    outcomesCount: number,
  ): Promise<TransactionReceipt> => {
    const indexSets = getIndexSets(outcomesCount)

    const transactionObject = await this.contract.redeemPositions(
      collateralToken,
      ethers.constants.HashZero,
      conditionId,
      indexSets,
    )

    return this.provider.waitForTransaction(transactionObject.hash)
  }

  static encodeSafeTransferFrom = (
    addressFrom: string,
    addressTo: string,
    positionId: BigNumber,
    outcomeTokensToTransfer: BigNumber,
  ): string => {
    const safeTransferFromInterface = new utils.Interface(conditionalTokensAbi)

    return safeTransferFromInterface.functions.safeTransferFrom.encode([
      addressFrom,
      addressTo,
      positionId,
      outcomeTokensToTransfer,
      '0x',
    ])
  }

  static encodeSetApprovalForAll = (address: string, approved: boolean): string => {
    const setApprovalForAllInterface = new utils.Interface(conditionalTokensAbi)

    return setApprovalForAllInterface.functions.setApprovalForAll.encode([address, approved])
  }

  static encodePrepareCondition = (questionId: string, oracleAddress: string, outcomeSlotCount: number): string => {
    const prepareConditionInterface = new utils.Interface(conditionalTokensAbi)

    return prepareConditionInterface.functions.prepareCondition.encode([
      oracleAddress,
      questionId,
      new BigNumber(outcomeSlotCount),
    ])
  }

  getOutcomeSlotCount = async (conditionId: string): Promise<BigNumber> => {
    return this.contract.getOutcomeSlotCount(conditionId)
  }

  getConditionId = (questionId: string, oracleAddress: string, outcomeSlotCount: number): string => {
    const conditionId = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint256'],
      [oracleAddress, questionId, outcomeSlotCount],
    )

    return conditionId
  }

  doesConditionExist = async (conditionId: string): Promise<boolean> => {
    const outcomeSlotCount = await this.getOutcomeSlotCount(conditionId)
    return !outcomeSlotCount.isZero()
  }

  static encodeRedeemPositions = (collateralToken: string, conditionId: string, outcomesCount: number): string => {
    const redeemPositionsInterface = new utils.Interface(conditionalTokensAbi)
    const indexSets = getIndexSets(outcomesCount)

    return redeemPositionsInterface.functions.redeemPositions.encode([
      collateralToken,
      ethers.constants.HashZero,
      conditionId,
      indexSets,
    ])
  }

  static encodeMergePositions = (
    collateralToken: string,
    conditionId: string,
    outcomesCount: number,
    amount: BigNumberish,
  ): string => {
    const redeemPositionsInterface = new utils.Interface(conditionalTokensAbi)
    const indexSets = getIndexSets(outcomesCount)

    return redeemPositionsInterface.functions.mergePositions.encode([
      collateralToken,
      ethers.constants.HashZero,
      conditionId,
      indexSets,
      amount,
    ])
  }
}

export { ConditionalTokenService }
