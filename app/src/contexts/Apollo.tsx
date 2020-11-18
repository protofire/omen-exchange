import { ApolloProvider } from '@apollo/react-hooks'
import { useWeb3React } from '@web3-react/core'
import React from 'react'

import { getApolloClient } from '../apolloClientConfig'

export const ApolloProviderWrapper: React.FC = ({ children }) => {
  const context = useWeb3React()
  const chainId = context.chainId == null ? 1 : context.chainId
  const client = React.useMemo(() => getApolloClient(chainId), [chainId])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
