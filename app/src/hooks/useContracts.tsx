import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

import { IPFS_GATEWAY } from '../common/constants'
import {
  ConditionalTokenService,
  DxTCRService,
  KlerosService,
  MarketMakerFactoryService,
  MarketMakerService,
  OracleService,
  RealitioService,
} from '../services'
import { getContractAddress } from '../util/networks'

export const useContracts = () => {
  const context = useWeb3React()
  const { library: provider } = context
  const account = context.account as Maybe<string>
  const chainId = context.chainId == null ? 1 : context.chainId

  const conditionalTokensAddress = getContractAddress(chainId, 'conditionalTokens')
  const conditionalTokens = useMemo(
    () => provider && new ConditionalTokenService(conditionalTokensAddress, provider, account),
    [conditionalTokensAddress, provider, account],
  )

  const marketMakerFactoryAddress = getContractAddress(chainId, 'marketMakerFactory')
  const marketMakerFactory = useMemo(
    () => provider && new MarketMakerFactoryService(marketMakerFactoryAddress, provider, account),
    [marketMakerFactoryAddress, provider, account],
  )

  const realitioAddress = getContractAddress(chainId, 'realitio')
  const realitio = useMemo(() => provider && new RealitioService(realitioAddress, provider, account), [
    realitioAddress,
    provider,
    account,
  ])

  const oracleAddress = getContractAddress(chainId, 'oracle')
  const oracle = useMemo(() => provider && new OracleService(oracleAddress, provider, account), [
    oracleAddress,
    provider,
    account,
  ])

  const klerosBadgeAddress = getContractAddress(chainId, 'klerosBadge')
  const klerosTokenViewAddress = getContractAddress(chainId, 'klerosTokenView')
  const klerosTCRAddress = getContractAddress(chainId, 'klerosTCR')
  const omenVerifiedMarketsAddress = getContractAddress(chainId, 'omenVerifiedMarkets')
  const kleros = useMemo(
    () =>
      new KlerosService(
        klerosBadgeAddress,
        klerosTokenViewAddress,
        klerosTCRAddress,
        omenVerifiedMarketsAddress,
        provider,
        account,
        IPFS_GATEWAY,
      ),
    [klerosBadgeAddress, klerosTokenViewAddress, klerosTCRAddress, omenVerifiedMarketsAddress, provider, account],
  )

  const buildMarketMaker = useMemo(
    () => (address: string) =>
      provider && new MarketMakerService(address, conditionalTokens, realitio, provider, account),
    [conditionalTokens, realitio, provider, account],
  )

  const dxTCRAddress = getContractAddress(chainId, 'dxTCR')
  const dxTCR = useMemo(() => provider && new DxTCRService(dxTCRAddress, provider), [provider, dxTCRAddress])

  return useMemo(
    () => ({
      conditionalTokens,
      marketMakerFactory,
      realitio,
      oracle,
      buildMarketMaker,
      kleros,
      dxTCR,
    }),
    [conditionalTokens, marketMakerFactory, realitio, oracle, kleros, buildMarketMaker, dxTCR],
  )
}

export type Contracts = ReturnType<typeof useContracts>
