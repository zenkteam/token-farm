[![Edo](https://github.com/stove-labs/token-farm/actions/workflows/edonet.yml/badge.svg)](https://github.com/stove-labs/token-farm/actions/workflows/edonet.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Dependencies

- Docker - used to run a local Tezos node together with the LIGO compiler (If you're on linux, follow the post-installation steps as well)
- Node.js `v12` - Javascript runtime environment that we'll use for testing and deployment
- LIGO `0.11.0` - High level programming language for the Tezos blockchain
- truffle@tezos - Testing framework, originally built for Ethereum that now includes support for Tezos.
- ganache-cli@tezos - Part of the Truffle suite of blockchain development tools. It creates isolated sandboxes using Flextesa to automate reproducible tests with faster networks.

# Getting started

> Make sure to use `node v12`.

```
yarn
yarn run fix-ligo-version 0.11.0
yarn run sandbox:start
yarn run test
```


# Deployment and Contract Interaction

To deploy the contract first copy `.env.sample` to `.env` and define the settings for the environment you want to deploy to.

Compile the contract using `yarn compile`.

Then you can call `ts-node ./scripts/deployment.ts` to deploy the contract. If the rewards are payed from the admins wallet, the delegation of those rewards is also activated.

If not you need to set the `DELEGATE_*` variables in the `.env` file and run `ts-node ./scripts/delegate.ts` to allow access to the funds.

Use `ts-node ./scripts/update.ts` to update the plan/penalty/... of the contract (defined in the code).


# Documentation

Check out the [wiki](https://github.com/stove-labs/token-farm/wiki/Contract-Architecture) page for more information on the [algorithm](https://github.com/stove-labs/token-farm/wiki/Algorithm), [contract architecture](https://github.com/stove-labs/token-farm/wiki/Contract-Architecture), [entrypoints](https://github.com/stove-labs/token-farm/wiki/Entrypoints) and [storage](https://github.com/stove-labs/token-farm/wiki/Storage).
