import { importKey } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import dotenv from 'dotenv';

dotenv.config();
const Tezos = new TezosToolkit(process.env.DEPLOY_RPC);

(async function () {
  console.log('updating farm contract settings...')
  await importKey(Tezos, process.env.UPDATE_PRIVATE_KEY);

  const farmContract = await Tezos.wallet.at(process.env.UPDATE_FARM_CONTRACT);

  const updatePromise = farmContract.methods.updatePlan(5, 200);

  const tx = await updatePromise.send()
  const result = await tx.confirmation(1)
  console.log(result.completed ? 'done' : 'failed');
})().catch(console.error);
