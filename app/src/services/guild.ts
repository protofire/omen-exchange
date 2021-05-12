import { Contract, Wallet, ethers, utils } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { ConnectedWeb3Context } from '../hooks'
import { getContractAddress } from '../util/networks'

const GuildAbi = [
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'bytes32', name: 'proposalId', type: 'bytes32' }],
    name: 'ProposalCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'bytes32', name: 'proposalId', type: 'bytes32' }],
    name: 'ProposalEnded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'bytes32', name: 'proposalId', type: 'bytes32' }],
    name: 'ProposalExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'bytes32', name: 'proposalId', type: 'bytes32' }],
    name: 'ProposalRejected',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'bytes4', name: 'functionSignature', type: 'bytes4' },
      { indexed: false, internalType: 'bool', name: 'allowance', type: 'bool' },
    ],
    name: 'SetAllowance',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'voter', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'TokensLocked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'voter', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'TokensReleased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'proposalId', type: 'bytes32' },
      { indexed: false, internalType: 'address', name: 'voter', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'VoteAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'proposalId', type: 'bytes32' },
      { indexed: false, internalType: 'address', name: 'voter', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'VoteRemoved',
    type: 'event',
  },
  { stateMutability: 'payable', type: 'fallback' },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes4', name: '', type: 'bytes4' },
    ],
    name: 'callPermissions',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32[]', name: 'proposalIds', type: 'bytes32[]' },
      { internalType: 'address', name: 'voter', type: 'address' },
    ],
    name: 'claimMarketValidationVoteRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'questionId', type: 'bytes32' }],
    name: 'createMarketValidationProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'to', type: 'address[]' },
      { internalType: 'bytes[]', name: 'data', type: 'bytes[]' },
      { internalType: 'uint256[]', name: 'value', type: 'uint256[]' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'bytes', name: 'contentHash', type: 'bytes' },
    ],
    name: 'createProposal',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'to', type: 'address[]' },
      { internalType: 'bytes[]', name: 'data', type: 'bytes[]' },
      { internalType: 'uint256[]', name: 'value', type: 'uint256[]' },
      { internalType: 'string[]', name: 'description', type: 'string[]' },
      { internalType: 'bytes[]', name: 'contentHash', type: 'bytes[]' },
    ],
    name: 'createProposals',
    outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'questionId', type: 'bytes32' }],
    name: 'endMarketValidationProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'proposalId', type: 'bytes32' }],
    name: 'endProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'bytes4', name: 'functionSignature', type: 'bytes4' },
    ],
    name: 'getCallPermission',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'getFuncSignature',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'proposalId', type: 'bytes32' }],
    name: 'getProposal',
    outputs: [
      { internalType: 'address', name: 'creator', type: 'address' },
      { internalType: 'uint256', name: 'startTime', type: 'uint256' },
      { internalType: 'uint256', name: 'endTime', type: 'uint256' },
      { internalType: 'address[]', name: 'to', type: 'address[]' },
      { internalType: 'bytes[]', name: 'data', type: 'bytes[]' },
      { internalType: 'uint256[]', name: 'value', type: 'uint256[]' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'bytes', name: 'contentHash', type: 'bytes' },
      { internalType: 'uint256', name: 'totalVotes', type: 'uint256' },
      { internalType: 'enum ERC20Guild.ProposalState', name: 'state', type: 'uint8' },
      { internalType: 'uint256', name: 'snapshotId', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'proposalId', type: 'bytes32' },
      { internalType: 'address', name: 'voter', type: 'address' },
    ],
    name: 'getProposalVotes',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getProposalsIdsLength',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getVotesForCreation',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getVotesForExecution',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'voter', type: 'address' },
      { internalType: 'bytes32', name: 'proposalId', type: 'bytes32' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'hashVote',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_proposalTime', type: 'uint256' },
      { internalType: 'uint256', name: '_timeForExecution', type: 'uint256' },
      { internalType: 'uint256', name: '_votesForExecution', type: 'uint256' },
      { internalType: 'uint256', name: '_votesForCreation', type: 'uint256' },
      { internalType: 'uint256', name: '_voteGas', type: 'uint256' },
      { internalType: 'uint256', name: '_maxGasPrice', type: 'uint256' },
      { internalType: 'uint256', name: '_lockTime', type: 'uint256' },
      { internalType: 'uint256', name: '_maxAmountVotes', type: 'uint256' },
      { internalType: 'address', name: '_realityIO', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_proposalTime', type: 'uint256' },
      { internalType: 'uint256', name: '_timeForExecution', type: 'uint256' },
      { internalType: 'uint256', name: '_votesForExecution', type: 'uint256' },
      { internalType: 'uint256', name: '_votesForCreation', type: 'uint256' },
      { internalType: 'string', name: '_name', type: 'string' },
      { internalType: 'uint256', name: '_voteGas', type: 'uint256' },
      { internalType: 'uint256', name: '_maxGasPrice', type: 'uint256' },
      { internalType: 'uint256', name: '_lockTime', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initialized',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lockTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'lockTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'marketValidationProposals',
    outputs: [
      { internalType: 'bytes32', name: 'marketValid', type: 'bytes32' },
      { internalType: 'bytes32', name: 'marketInvalid', type: 'bytes32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxAmountVotes',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxGasPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'positiveVotesCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proposalNonce',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proposalTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'proposals',
    outputs: [
      { internalType: 'address', name: 'creator', type: 'address' },
      { internalType: 'uint256', name: 'startTime', type: 'uint256' },
      { internalType: 'uint256', name: 'endTime', type: 'uint256' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'bytes', name: 'contentHash', type: 'bytes' },
      { internalType: 'uint256', name: 'totalVotes', type: 'uint256' },
      { internalType: 'enum ERC20Guild.ProposalState', name: 'state', type: 'uint8' },
      { internalType: 'uint256', name: 'snapshotId', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'proposalsForMarketValidation',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'proposalsIds',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'realityIO',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'releaseTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'rewardsClaimed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'to', type: 'address[]' },
      { internalType: 'bytes4[]', name: 'functionSignature', type: 'bytes4[]' },
      { internalType: 'bool[]', name: 'allowance', type: 'bool[]' },
    ],
    name: 'setAllowance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_proposalTime', type: 'uint256' },
      { internalType: 'uint256', name: '_timeForExecution', type: 'uint256' },
      { internalType: 'uint256', name: '_votesForExecution', type: 'uint256' },
      { internalType: 'uint256', name: '_votesForCreation', type: 'uint256' },
      { internalType: 'uint256', name: '_voteGas', type: 'uint256' },
      { internalType: 'uint256', name: '_maxGasPrice', type: 'uint256' },
      { internalType: 'uint256', name: '_lockTime', type: 'uint256' },
    ],
    name: 'setConfig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_maxAmountVotes', type: 'uint256' },
      { internalType: 'address', name: '_realityIO', type: 'address' },
      { internalType: 'uint256', name: '_successfulVoteReward', type: 'uint256' },
      { internalType: 'uint256', name: '_unsuccessfulVoteReward', type: 'uint256' },
    ],
    name: 'setOMNGuildConfig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'proposalId', type: 'bytes32' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'address', name: 'voter', type: 'address' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'setSignedVote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32[]', name: 'proposalIds', type: 'bytes32[]' },
      { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
      { internalType: 'address[]', name: 'voters', type: 'address[]' },
      { internalType: 'bytes[]', name: 'signatures', type: 'bytes[]' },
    ],
    name: 'setSignedVotes',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'proposalId', type: 'bytes32' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'setVote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32[]', name: 'proposalIds', type: 'bytes32[]' },
      { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
    ],
    name: 'setVotes',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'signedVotes',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'submitAnswerByArbitratorSignature',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'successfulVoteReward',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'timeForExecution',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token',
    outputs: [{ internalType: 'contract IERC20Upgradeable', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tokenVault',
    outputs: [{ internalType: 'contract TokenVault', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'tokensLocked',
    outputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalLocked',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'snapshotId', type: 'uint256' }],
    name: 'totalLockedAt',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unsuccessfulVoteReward',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'voteGas',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'votesForCreation',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'votesForExecution',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'votesOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address[]', name: 'accounts', type: 'address[]' }],
    name: 'votesOf',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'snapshotId', type: 'uint256' },
    ],
    name: 'votesOfAt',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'accounts', type: 'address[]' },
      { internalType: 'uint256[]', name: 'snapshotIds', type: 'uint256[]' },
    ],
    name: 'votesOfAt',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
]

class OmenGuildService {
  contract: Contract
  user: any

  constructor(context: ConnectedWeb3Context) {
    const { library: provider, networkId } = context
    const signer = provider.getSigner()
    this.user = signer
    const omenGuildAddress = getContractAddress(networkId, 'omenGuildProxy')

    this.contract = new ethers.Contract(omenGuildAddress, GuildAbi, provider).connect(signer)
  }
  get getContract(): Contract {
    return this.contract
  }
  static encodeLockTokens = (amount: BigNumber) => {
    const guildInterface = new utils.Interface(GuildAbi)
    return guildInterface.functions.lockTokens.encode([amount])
  }

  tokensLocked = async (address: string) => {
    const addresses = await this.user.getAddress()
    console.log(addresses, address)
    const locked = await this.getContract.tokensLocked(addresses)
    return locked
  }
  totalLocked = async () => {
    return this.getContract.totalLocked()
  }
}
export { OmenGuildService }
