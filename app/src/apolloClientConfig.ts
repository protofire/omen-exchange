import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { from, split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import apolloLogger from 'apollo-link-logger'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

import { getGraphUris } from './util/networks'

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const getLink = (httpLink: any, wsLink: any) =>
  split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    wsLink,
    httpLink,
  )

export const getApolloClient = (networkId: number) => {
  const { httpUri, wsUri } = getGraphUris(networkId)
  const httpLink = new HttpLink({
    uri: httpUri,
  })
  const wsLink = new WebSocketLink({
    uri: wsUri,
    options: {
      reconnect: true,
    },
  })
  return new ApolloClient({
    link: from([apolloLogger, getLink(httpLink, wsLink)]),
    cache: new InMemoryCache(),
  })
}
