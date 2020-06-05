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

    Set `REACT_APP_VERSION=omen` and set `REACT_APP_INFURA_PROJECT_ID` to your [Infura](https://infura.io/) project id.
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
