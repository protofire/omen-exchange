# Developing

## Setup

1. Clone this repository
2. Install dependencies:

    ```
    cd app && yarn
    ```

3. Create a `.env` file:

    ```
    cp .env.example .env
    ```

    Set `REACT_APP_INFURA_PROJECT_ID` to your [Infura](https://infura.io/) project id.
    The rest of the environment variables should work fine with the default values, but you can change them however you
    want.

4. Start the application with `yarn start` and connect your wallet to either Rinkeby or the Mainnet.

## Directory structure

Most of the code is located under the `app/src` directory and the entry point is `index.tsx`.

The `common/constants.ts` module extracts the environment variables, parses them if necessary, and exports them.  It
also exposes some constants that don't come from the environment.

`components` has most of the react components that make up the app. `contexts` and `hooks` have custom components and hooks.

`pages` has components that represent different routes.

`queries` has the GraphQL queries and query builders.

`services` has classes that are used as wrappers for the smart contracts used by the app.

`store` has things related to global state management with Redux.

`theme` has constants and utils related to the theming of the app.

`util` has some common utilities. As a general rule, everything here should be just pure functions.

## Stack

The app is built with React (through `create-react-app`), [react-router](https://reacttraining.com/react-router/) and TypeScript.

[web3-react](https://github.com/NoahZinsmeister/web3-react) is used for handling connections to the blockchain.

Most of the data is obtained through [thegraph](https://thegraph.com). You can explore the subgraph
[here](https://thegraph.com/explorer/subgraph/gnosis/omen).

[Gnosis's CPK](https://github.com/gnosis/contract-proxy-kit) is used for batching transactions.

The app relies on the [realitio](https://realit.io/) contracts and Gnosis's [conditional
tokens](https://docs.gnosis.io/conditionaltokens/) framework. The contracts used for creating the market makers can be
found [here](https://github.com/gnosis/conditional-tokens-market-makers).
