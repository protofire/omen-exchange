# Developing

## Setup

1. Clone this repository
2. Install dependencies:

   ```
   cd app && yarn
   ```

3. Start the application with `yarn start` and connect your wallet to either Rinkeby, Mainnet or xDai.

## Directory structure

Most of the code is located under the `app/src` directory and the entry point is `index.tsx`.

The `common/constants.ts` module extracts the environment variables, parses them if necessary, and exports them. It
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

## Style guide

### Git style guide

- https://udacity.github.io/git-styleguide/
- Focus on type and subject
- Body & footer can be generally ignored

### Typescript style guide

- https://google.github.io/styleguide/tsguide.html

### React style guide

- https://github.com/airbnb/javascript/tree/master/react
  - Linter seems to follow a lot of these rules automatically
- Logic should be separated from views
  - See: https://www.g2i.co/blog/react-separation-of-concerns

### Issue style guide

- Title
  - Should clearly and briefly describe the issue. Should use an imperative tone, e.g. use 'change' instead of 'changed' or 'changes'.
- Description
  - Should clearly explain **what** needs to be done and **why** it needs to be done. May also briefly explain **how** it can be done.
- Assignment
  - All issues should have someone assigned at some point.
- Label
  - Should set priority
  - Should categorize task, e.g. `bug`, `enhancement`, or a milestone.
- Milestone
  - If relevant, the issue should be included in an open milestone.

### Pull request style guide

- [Link PR to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-issues/linking-a-pull-request-to-an-issue)
- Title
  - Clearly explains **what** was done and **why**.
- Description
  - Briefly explains the changes made.
  - Test cases if relevant.
- Reviewer
  - Should request suggested reviewer (if active contributor).
    - This is who is most likely to be familiar with the code modified.

### Review guide

- Checklist: https://www.evoketechnologies.com/blog/code-review-checklist-perform-effective-code-reviews/
- Aim to have one code reviewer + @pimato if there is a change to the views.
  - Reviewer should leave with a high degree of confidence in the quality of the code.
- Often we should invite multiple contributors to test the changes without reviewing the code (at least not in too much detail).
