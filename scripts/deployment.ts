import { importKey } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import BigNumber from 'bignumber.js';
import dotenv from 'dotenv';

dotenv.config();
const Tezos = new TezosToolkit(process.env.DEPLOY_RPC);

import farmFA2PenaltyContract from '../build/ligo-cli/farmFA2Penalty.json';
import initialStorage from '../migrations/initialStorage/farm';

(async function () {
    await importKey(Tezos, process.env.DEPLOY_PRIVATE_KEY);
    
    console.log('Deploying the farm contract...')
    const storage = initialStorage.baseWithPenalty();

    // settings for penalty
    storage.farm.penalty.feePercentage = parseInt(process.env.DEPLOY_PENALTY_FEE_PERCENTAGE);
    storage.farm.penalty.periodSeconds = parseInt(process.env.DEPLOY_PENALTY_PERIOD_SECONDS);

    // settings for addresses
    storage.addresses.admin = process.env.DEPLOY_ADDRESS_ADMIN_WALLET;
    //  the account that holds the reward tokens and approves the farm
    storage.addresses.rewardReserve = process.env.DEPLOY_ADDRESS_REWARD_WALLET;
    // where to pay out penalties to
    storage.addresses.penaltyPayoutAddress = process.env.DEPLOY_ADDRESS_PENALTY_PAYOUT_WALLET;
    // QUIPUSWAP DEX ADDRESS for the token to be staked
    storage.addresses.lpTokenContract = process.env.DEPLOY_ADDRESS_STAKE_TOKEN;
    // the FA2 token contract for rewards
    storage.addresses.rewardTokenContract = process.env.DEPLOY_ADDRESS_REWARD_TOKEN;

    // settings for the FA2 token IDs - both LP DEX and reward token
    storage.tokenIds = {
        lp: 0,
        reward: 0
    };
    
    // settings for the farm algorithm
    storage.farm.plannedRewards.rewardPerBlock = new BigNumber(process.env.DEPLOY_REWARD_PER_BLOCK);
    storage.farm.plannedRewards.totalBlocks = new BigNumber(process.env.DEPLOY_REWARD_TOTAL_BLOCKS);

    const originationOperation = await Tezos.contract
        .originate({
            code: farmFA2PenaltyContract,
            storage: storage
        });
        
    await originationOperation.confirmation(1);
    console.log('Farm originated at:', originationOperation.contractAddress);


    // delegate
    if (process.env.DEPLOY_ADDRESS_ADMIN_WALLET !== process.env.DEPLOY_ADDRESS_REWARD_WALLET) {
      console.warn('Please ensure that the reward wallet delegates access to its token to the farm contract. You can use "scripts/delegate.ts" to do so.')
    } else {
      console.log('Delegating access to the reward token to the contract...')
      const rewardTokenContract = await Tezos.wallet.at(process.env.DEPLOY_ADDRESS_REWARD_TOKEN);

      const addOperatorTransactionPromise = rewardTokenContract.methods.update_operators([
        {
          add_operator: {
            owner: process.env.DEPLOY_ADDRESS_REWARD_WALLET,
            operator: originationOperation.contractAddress,
            token_id: 0, // on mainnet required
          },
        },
      ]);

      const tx = await addOperatorTransactionPromise.send();
      const result = await tx.confirmation(1)
      console.log(result.completed ? 'Token access delegated.' : 'Token access delegation failed!');
    }

    console.log('DONE')
})().catch(console.error);
