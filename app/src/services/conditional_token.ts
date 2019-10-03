import { ethers, Wallet } from 'ethers'

import { getLogger } from '../util/logger'
import { getContractAddress } from '../util/addresses'
import { BigNumberish, BigNumber } from 'ethers/utils'

const logger = getLogger('Services::Conditional-Token')

const conditionTokenAbi = [
  'function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external',
  'event ConditionPreparation(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint outcomeSlotCount)',
  'function setApprovalForAll(address operator, bool approved) external',
  'function isApprovedForAll(address owner, address operator) external view returns (bool)',
  'function reportPayouts(bytes32 questionId, uint[] payouts) external',
  'function payoutDenominator(bytes32) public view returns (uint)',
  'function redeemPositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] indexSets) external',
]

class ConditionalTokenService {
  static prepareCondition = async (
    questionId: string,
    provider: any,
    networkId: number,
    outcomeSlotCount = 2,
  ): Promise<string> => {
    const signer = provider.getSigner()

    const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')
    const conditionalTokenContract = new ethers.Contract(
      conditionalTokensAddress,
      conditionTokenAbi,
      provider,
    ).connect(signer)

    // Use signer address only for development
    const oracleAddress =
      process.env.NODE_ENV === 'development'
        ? await signer.getAddress()
        : getContractAddress(networkId, 'realitioArbitrator')

    const transactionObject = await conditionalTokenContract.prepareCondition(
      oracleAddress,
      questionId,
      outcomeSlotCount,
    )
    logger.log(`Prepare condition transaction hash: ${transactionObject.hash}`)

    const conditionId = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint256'],
      [oracleAddress, questionId, outcomeSlotCount],
    )

    return conditionId
  }

  static getQuestionId = async (
    conditionId: string,
    provider: any,
    networkId: number,
  ): Promise<string> => {
    const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')

    const conditionalTokenContract = new ethers.Contract(
      conditionalTokensAddress,
      conditionTokenAbi,
      provider,
    )

    const filter: any = conditionalTokenContract.filters.ConditionPreparation(conditionId)

    filter.fromBlock = '0x1'

    const logs = await provider.getLogs(filter)

    if (logs.length === 0) {
      throw new Error(`No ConditionPreparation event found for conditionId '${conditionId}'`)
    }
    if (logs.length > 1) {
      console.warn(
        `There should be only one ConditionPreparation event for conditionId '${conditionId}'`,
      )
    }

    const iface = new ethers.utils.Interface(conditionTokenAbi)
    const event = iface.parseLog(logs[0])

    return event.values.questionId
  }

  static setApprovalForAll = async (
    marketMakerAddress: string,
    provider: any,
    networkId: number,
  ): Promise<string> => {
    const signer: Wallet = provider.getSigner()

    const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')
    const conditionalTokenContract = new ethers.Contract(
      conditionalTokensAddress,
      conditionTokenAbi,
      provider,
    ).connect(signer)

    return await conditionalTokenContract.setApprovalForAll(marketMakerAddress, true)
  }

  static isApprovedForAll = async (
    marketMakerAddress: string,
    provider: any,
    networkId: number,
  ): Promise<boolean> => {
    const signer: Wallet = provider.getSigner()
    const signerAddress = await signer.getAddress()

    const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')
    const conditionalTokenContract = new ethers.Contract(
      conditionalTokensAddress,
      conditionTokenAbi,
      provider,
    )

    return await conditionalTokenContract.isApprovedForAll(signerAddress, marketMakerAddress)
  }

  static reportPayouts = async (
    questionId: string,
    payouts: BigNumberish[],
    networkId: number,
    provider: any,
  ): Promise<any> => {
    const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')

    const conditionalTokensContract = new ethers.Contract(
      conditionalTokensAddress,
      conditionTokenAbi,
      provider,
    )
    return await conditionalTokensContract.reportPayouts(questionId, payouts)
  }

  static isConditionResolved = async (
    conditionId: string,
    networkId: number,
    provider: any,
  ): Promise<boolean> => {
    const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')

    const conditionalTokensContract = new ethers.Contract(
      conditionalTokensAddress,
      conditionTokenAbi,
      provider,
    )
    const payoutDenominator: BigNumber = await conditionalTokensContract.payoutDenominator(
      conditionId,
    )

    return !payoutDenominator.isZero()
  }

  static redeemPositions = async (
    collateralToken: string,
    conditionId: string,
    networkId: number,
    provider: any,
  ): Promise<any> => {
    const signer = provider.getSigner()

    const conditionalTokensAddress = getContractAddress(networkId, 'conditionalTokens')

    const conditionalTokensContract = new ethers.Contract(
      conditionalTokensAddress,
      conditionTokenAbi,
      provider,
    ).connect(signer)

    return await conditionalTokensContract.redeemPositions(
      collateralToken,
      ethers.constants.HashZero,
      conditionId,
      [1, 2],
    )
  }
}

export { ConditionalTokenService }
