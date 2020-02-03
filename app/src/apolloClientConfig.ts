import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

import { GRAPH_HTTP, GRAPH_WS } from './common/constants'

// Create an http link:
const httpLink = new HttpLink({
  uri: GRAPH_HTTP,
})

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: GRAPH_WS as string,
  options: {
    reconnect: true,
  },
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  wsLink,
  httpLink,
)

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})
