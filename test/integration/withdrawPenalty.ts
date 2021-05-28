import _farmContract  from '../helpers/farm';
import _initialStorageFarm from '../../migrations/initialStorage/farm';
import _tokenContract, { lpToken, rewardToken } from '../helpers/token';
import _taquito from '../helpers/taquito';
import accounts from '../../scripts/sandbox/accounts';
import BigNumber from 'bignumber.js';
import { expect } from 'chai';
const getDelayedISOTime = require('../../helpers/getDelayedISOTime');

contract('farm contract', () => {
    let farmContract;
    let lpTokenContract;
    let rewardTokenContract;
    let rewardPerBlock;
    let expectedRewards;
    const balance: any = {};
    const penalty: any = {
        feePercentage: 5n,
        periodSeconds: 84600n
    };;

    beforeEach(async () => {

        lpTokenContract = await _tokenContract.originate('LP')
        rewardTokenContract = await _tokenContract.originate('Reward')
        rewardPerBlock = rewardToken('10');
        const totalBlocks = 100000;
        const totalRewards = (new BigNumber(rewardPerBlock)).multipliedBy(totalBlocks);
        const penalty = 
        const lastUpdate = getDelayedISOTime(-10);

        const initialStorage = _initialStorageFarm.productionWithPenalty(
            lpTokenContract.instance.address, 
            rewardTokenContract.instance.address,
            rewardPerBlock,
            totalBlocks,
            penalty,
            lastUpdate,
        );

        farmContract = await _farmContract.originate(initialStorage);

        // give allowance to farm contract to spend on behalf of the address that owns reward tokens
        await _taquito.signAs(accounts.walter.sk, rewardTokenContract, async () => {
            const spender = farmContract.instance.address;
            const value = totalRewards.toFixed();
            await rewardTokenContract.approve(spender, value);
        });

        // fund alice account with LP tokens
        await _taquito.signAs(accounts.walter.sk, lpTokenContract, async () => {
            const transferParameters = {
                from: accounts.walter.pkh, 
                to: accounts.alice.pkh,
                value: lpToken(100)
            }
            await lpTokenContract.transfer(transferParameters);
        });

        balance.delegatorLpBefore = await lpTokenContract.getBalance(accounts.alice.pkh);
        balance.farmLpBefore = await lpTokenContract.getBalance(farmContract.instance.address);
        balance.delegatorRewardBefore = await rewardTokenContract.getBalance(accounts.alice.pkh);
    });

    it('can penalize early withdrawal for one staker', async () => {
        const spender = farmContract.instance.address;
        const depositValue = lpToken(100);
        // alice gives farm contract an allowance
        await lpTokenContract.approve(spender, depositValue);
        
        await farmContract.deposit(depositValue);
        // withdraws after 5 blocks
        const blocks = 5;
        await _taquito.increaseBlock(blocks);
        await farmContract.withdraw(depositValue);

        balance.delegatorLpAfter = await lpTokenContract.getBalance(accounts.alice.pkh);
        expect(balance.delegatorLpAfter.toFixed()).to.equal(balance.delegatorLpBefore.toFixed());
        
        balance.farmLpAfter = await lpTokenContract.getBalance(farmContract.instance.address);
        expect(balance.farmLpAfter.toFixed()).to.equal(balance.farmLpBefore.toFixed());

        balance.delegatorRewardAfter = await rewardTokenContract.getBalance(accounts.alice.pkh);
        const allRewards = (new BigNumber(rewardPerBlock)).multipliedBy(blocks + 1);
        expectedRewards = allRewards.multipliedBy((100 - penalty.feePercentage) / 100);
        // only one staker, hence all rewards to her
        const delegatorRewardAfter = balance.delegatorRewardBefore.plus(expectedRewards);
        expect(balance.delegatorRewardAfter.toFixed()).to.equal(delegatorRewardAfter.toFixed());
    });
});