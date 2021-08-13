import { importKey } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import BigNumber from 'bignumber.js';
//const Tezos = new TezosToolkit('https://api.tez.ie/rpc/granadanet');
const Tezos = new TezosToolkit('http://localhost:8732/');


import farmFA2PenaltyContract from '../build/ligo-cli/farmFA2Penalty.json';
import initialStorage from '../migrations/initialStorage/farm';

(async function () {
    await importKey(Tezos, "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq")
    
    const storage = initialStorage.baseWithPenalty();

    // settings for penalty
    const penalty = {
        feePercentage: 5,
        periodSeconds: 84600
    };

    storage.farm.penalty.feePercentage = penalty.feePercentage;
    storage.farm.penalty.periodSeconds = penalty.periodSeconds;

    // settings for addresses

    // storage.addresses.admin = "I am an address";
    // storage.addresses.lpTokenContract = "QUIPUSWAP DEX ADDRESS for the token to be staked";
    // storage.addresses.rewardReserve = "the account that holds the reward tokens and approves the farm";
    // storage.addresses.rewardTokenContract = "the FA2 token contract for rewards";

    // settings for the FA2 token IDs - both LP DEX and reward token
    storage.tokenIds = {
        lp: 0,
        reward: 0
    };
    
    // settings for the farm algorithm
    storage.farm.plannedRewards.rewardPerBlock = new BigNumber(5);
    storage.farm.plannedRewards.totalBlocks = new BigNumber(5);

    const originationOperation = await Tezos.contract
        .originate({
            code: farmFA2PenaltyContract,
            storage: storage
        });
        
    await originationOperation.confirmation(1);
    console.log('Farm originated at:', originationOperation.contractAddress);
})();