import { ethers, Wallet, Contract } from 'ethers'

import { getLogger } from '../util/logger'
import { BigNumber } from 'ethers/utils'

const logger = getLogger('Services::Conditional-Token')

const conditionalTokensAbi = [
  'function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external',
  'event ConditionPreparation(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint outcomeSlotCount)',
  'function setApprovalForAll(address operator, bool approved) external',
  'function isApprovedForAll(address owner, address operator) external view returns (bool)',
  'function reportPayouts(bytes32 questionId, uint[] payouts) external',
  'function payoutNumerators(bytes32, uint) public view returns (uint)',
  'function payoutDenominator(bytes32) public view returns (uint)',
  'function redeemPositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] indexSets) external',
  'function getCollectionId(bytes32 parentCollectionId, bytes32 conditionId, uint indexSet) external view returns (bytes32) ',
  'function getPositionId(address collateralToken, bytes32 collectionId) external pure returns (uint) ',
  'function balanceOf(address owner, uint256 positionId) external view returns (uint256)',
]

class ConditionalTokenService {
  contract: Contract
  address: string
  signerAddress: Maybe<string>
  provider: any

  constructor(address: string, provider: any, signerAddress: Maybe<string>) {
    if (signerAddress) {
      const signer: Wallet = provider.getSigner()
      this.contract = new ethers.Contract(address, conditionalTokensAbi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(address, conditionalTokensAbi, provider)
    }
    this.address = address
    this.signerAddress = signerAddress
    this.provider = provider
  }

  prepareCondition = async (
    questionId: string,
    oracleAddress: string,
    outcomeSlotCount = 2,
  ): Promise<string> => {
    const transactionObject = await this.contract.prepareCondition(
      oracleAddress,
      questionId,
      new BigNumber(outcomeSlotCount),
      {
        value: '0x0',
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

  getCollectionIdForYes = async (conditionId: string): Promise<any> => {
    return this.contract.getCollectionId(ethers.constants.HashZero, conditionId, 1)
  }

  getCollectionIdForNo = async (conditionId: string): Promise<any> => {
    return this.contract.getCollectionId(ethers.constants.HashZero, conditionId, 2)
  }

  getPositionId = async (collateralAddress: string, collectionId: string): Promise<any> => {
    return this.contract.getPositionId(collateralAddress, collectionId)
  }

  getBalanceOf = async (ownerAddress: string, positionId: string): Promise<any> => {
    return this.contract.balanceOf(ownerAddress, positionId)
  }

  getQuestionId = async (conditionId: string): Promise<string> => {
    const filter: any = this.contract.filters.ConditionPreparation(conditionId)

    const logs = await this.provider.getLogs({
      ...filter,
      fromBlock: 1,
      toBlock: 'latest',
    })

    if (logs.length === 0) {
      throw new Error(`No ConditionPreparation event found for conditionId '${conditionId}'`)
    }
    if (logs.length > 1) {
      logger.warn(
        `There should be only one ConditionPreparation event for conditionId '${conditionId}'`,
      )
    }

    const iface = new ethers.utils.Interface(conditionalTokensAbi)
    const event = iface.parseLog(logs[0])

    return event.values.questionId
  }

  setApprovalForAll = async (marketMakerAddress: string): Promise<string> => {
    return this.contract.setApprovalForAll(marketMakerAddress, true)
  }

  isApprovedForAll = async (marketMakerAddress: string): Promise<boolean> => {
    return this.contract.isApprovedForAll(this.signerAddress, marketMakerAddress)
  }

  reportPayouts = async (questionId: string): Promise<any> => {
    return this.contract.reportPayouts(questionId, [1, 0])
  }

  isConditionResolved = async (conditionId: string): Promise<boolean> => {
    const payoutDenominator: BigNumber = await this.contract.payoutDenominator(conditionId)

    return !payoutDenominator.isZero()
  }

  redeemPositions = async (collateralToken: string, conditionId: string) => {
    const transactionObject = await this.contract.redeemPositions(
      collateralToken,
      ethers.constants.HashZero,
      conditionId,
      [1, 2],
    )
    await this.provider.waitForTransaction(transactionObject.hash)
  }
}

export { ConditionalTokenService }
