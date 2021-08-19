import { importKey } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import dotenv from 'dotenv';

dotenv.config();
const Tezos = new TezosToolkit(process.env.DEPLOY_RPC);

(async function () {

    await importKey(Tezos, process.env.DELEGATE_PRIVATE_KEY);

    const rewardTokenContract = await Tezos.wallet.at(process.env.DEPLOY_ADDRESS_REWARD_TOKEN);

    const addOperatorTransactionPromise = rewardTokenContract.methods.update_operators([
      {
        add_operator: {
          owner: process.env.DEPLOY_ADDRESS_REWARD_WALLET,
          operator: process.env.DELEGATE_FARM_CONTRACT,
          token_id: 0, // on mainnet required
        },
      },
    ]);

    const tx = await addOperatorTransactionPromise.send()
    const result = await tx.confirmation(1)
    console.log(result.completed ? 'done' : 'failed');
})().catch(console.error);
