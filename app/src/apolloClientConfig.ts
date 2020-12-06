import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { from, split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import apolloLogger from 'apollo-link-logger'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

import { getLogger } from './util/logger'
import { getGraphUris } from './util/networks'

const logger = getLogger('apolloCLientConfig')

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const getLink = (httpLink: any, wsLink: any) =>
  split(
    // split based on operation type
    ({ query }) => {
      try {
        // InMemoryCache adds __typename to every query to better understand our schema
        // However thegraph does not supply a __typename field for _meta queries, causing an error (https://github.com/graphprotocol/graph-node/issues/1280)
        // While there are solutions that remove __typename for every query it is better to remove it just for _meta queries
        // @ts-expect-error ignore
        const name = query.definitions[0] && query.definitions[0].selectionSet.selections[0].name.value
        if (name === '_meta') {
          // @ts-expect-error ignore
          const selections = query.definitions[0].selectionSet.selections[0].selectionSet.selections
          if (selections.length > 1) {
            selections.pop()
            selections[0].selectionSet.selections.pop()
          }
        }
      } catch (error) {
        logger.error(error.message)
      }
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
