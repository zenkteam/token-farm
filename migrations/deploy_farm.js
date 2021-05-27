import { TezosToolkit } from '@taquito/taquito';

const saveContractAddress = require('../helpers/saveContractAddress');
const initialStorage = require('./initialStorage/farm');
const Tezos = new TezosToolkit('https://api.tez.ie/rpc/florencenet');

// generic.json is referring to Michelson source code in JSON representation
// yarn && yarn run fix-ligo-version 0.11.0
// ligo compile-contract contracts/main/farm/farmFA2.religo main --michelson-format=json > farmFA2.json
const farm = require('./farmFA2.json')

module.exports = async (deployer, network, accounts) => {
   Tezos.contract
  .originate({
    code: farm,
    storage: initialStorage.default.base()
    })
  .then((originationOp) => {
    println(`Waiting for confirmation of origination for ${originationOp.contractAddress}...`);
    return originationOp.contract();
  })
  .then((contract) => {
    saveContractAddress('farm', contract.address)
    println(`Origination completed.`);
  })
  .catch((error) => println(`Error: ${JSON.stringify(error, null, 2)}`));
};



