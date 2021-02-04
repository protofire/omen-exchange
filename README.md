[![Netlify Status](https://api.netlify.com/api/v1/badges/2da38309-7dbe-43bb-bb2a-ba3186bc3556/deploy-status)](https://app.netlify.com/sites/conditional/deploys)

# Omen

## Building

The app code lives in the `app` folder. Use `yarn` to install dependencies.

```bash
cd app/
yarn
```

Create a `.env` file. See `.env.example` for environment variables which may be set.

For Omen builds, use `yarn build`.

The `build` directory in the `app` directory will now contain the build to be served.


## Contracts

| Contract | xDai | Sokol | Arbitrum |
| -------- | -------- | -------- | -------- |
| [ConditionalTokens](https://github.com/gnosis/conditional-tokens-contracts) | [0xCeAfDD6bc0bEF976fdCd1112955828E00543c0Ce](https://blockscout.com/poa/xdai/address/0xCeAfDD6bc0bEF976fdCd1112955828E00543c0Ce/read-contract)     | [0x0Db8C35045a830DC7F2A4dd87ef90e7A9Cd0534f](https://blockscout.com/poa/sokol/address/0x0Db8C35045a830DC7F2A4dd87ef90e7A9Cd0534f/contracts)     | -     |
| FPMMDeterministicFactory | [0x9083A2B699c0a4AD06F63580BDE2635d26a3eeF0](https://blockscout.com/poa/xdai/address/0x9083A2B699c0a4AD06F63580BDE2635d26a3eeF0/contracts) | [0x2fb8cc057946DCFA32D8eA8115A1Dd630f6efea5](https://blockscout.com/poa/sokol/address/0x2fb8cc057946DCFA32D8eA8115A1Dd630f6efea5/contracts) | -     |
| [Kleros bridge](https://github.com/kleros/cross-chain-realitio-proxy) | [0xe40DD83a262da3f56976038F1554Fe541Fa75ecd](https://blockscout.com/poa/xdai/address/0xe40DD83a262da3f56976038F1554Fe541Fa75ecd/contracts) | [0x37Fcdb26F12f3FC76F2424EC6B94D434a959A0f7](https://blockscout.com/poa/sokol/address/0x37Fcdb26F12f3FC76F2424EC6B94D434a959A0f7/contracts) | -     |
| [Reality.eth](https://github.com/realitio/realitio-contracts) | [0x79e32aE03fb27B07C89c0c568F80287C01ca2E57](https://blockscout.com/poa/xdai/address/0x79e32aE03fb27B07C89c0c568F80287C01ca2E57/contracts) | [0x90a617ed516ab7fAaBA56CcEDA0C5D952f294d03](https://blockscout.com/poa/sokol/address/0x90a617ed516ab7fAaBA56CcEDA0C5D952f294d03/contracts) | -     |
| Reality.eth Oracle Adapters | [0x2bf1BFb0eB6276a4F4B60044068Cb8CdEB89f79B](https://blockscout.com/poa/xdai/address/0x2bf1BFb0eB6276a4F4B60044068Cb8CdEB89f79B/contracts) | [0xa57EBD93faa73b3491aAe396557D6ceC24fC6984](https://blockscout.com/poa/sokol/address/0xa57EBD93faa73b3491aAe396557D6ceC24fC6984/contracts) | -     |
| Reality.eth Oracle Adapters (Scalar) | [0xb97FCb6adf4c4aF9981932a004e6CC47173d0Bfc](https://blockscout.com/poa/xdai/address/0xb97FCb6adf4c4aF9981932a004e6CC47173d0Bfc/contracts) | [0x1D369EEC97cF2E62c8DBB804b3998Bf15bcb67dB](https://blockscout.com/poa/sokol/address/0x1D369EEC97cF2E62c8DBB804b3998Bf15bcb67dB/contracts) | -     |
| CPKFactory | [0xfC7577774887aAE7bAcdf0Fc8ce041DA0b3200f7](https://blockscout.com/poa/xdai/address/0xfC7577774887aAE7bAcdf0Fc8ce041DA0b3200f7/contracts) | [0xaaF0CCef0C0C355Ee764B3d36bcCF257C527269B](https://blockscout.com/poa/sokol/address/0xaaF0CCef0C0C355Ee764B3d36bcCF257C527269B/contracts) | -     |
| Uniswap V2 Router | [0x1C232F01118CB8B424793ae03F870aa7D0ac7f77](https://blockscout.com/poa/xdai/address/0x1C232F01118CB8B424793ae03F870aa7D0ac7f77/contracts) | [0x5948f454fceF54e81757e96f7ebb2b91A064771c](https://blockscout.com/poa/sokol/address/0x5948f454fceF54e81757e96f7ebb2b91A064771c/contracts) | -     |
| Uniswap V2 Factory | [0xA818b4F111Ccac7AA31D0BCc0806d64F2E0737D7](https://blockscout.com/poa/xdai/address/0xA818b4F111Ccac7AA31D0BCc0806d64F2E0737D7/contracts) | [0x985B5011c850C27ee1cE0a0982B8E9c230596960](https://blockscout.com/poa/sokol/address/0x985B5011c850C27ee1cE0a0982B8E9c230596960/contracts) | -     |
| Wrapped1155Factory | [0xDE6943f3717738038159a406FF157d4eb3238c1B](https://blockscout.com/poa/xdai/address/0xDE6943f3717738038159a406FF157d4eb3238c1B/contracts) | [0xDE6943f3717738038159a406FF157d4eb3238c1B](https://blockscout.com/poa/sokol/address/0xDE6943f3717738038159a406FF157d4eb3238c1B/transactions) | -     |

## Subgraphs

| Subgraphs | xDai | Sokol | Arbitrum |
| -------- | -------- | -------- | -------- |
| Omen | [Omen-xDai](https://thegraph.com/explorer/subgraph/protofire/omen-xdai) | [Omen-Sokol](https://thegraph.com/explorer/subgraph/protofire/omen-sokol) | - |
| Conditional Tokens Subgraph | [Conditional-Tokens-xDai](https://thegraph.com/explorer/subgraph/davidalbela/conditional-tokens-xdai) | [Conditional-Tokens-Sokol](https://thegraph.com/explorer/subgraph/davidalbela/conditional-tokens-sokol) | - |
