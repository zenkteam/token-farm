import _farmContract  from '../helpers/farm';
import _initialStorageFarm from '../../migrations/initialStorage/farm';
import _tokenContractFA12, { lpToken, rewardToken } from '../helpers/token';
import _tokenContractFA2 from '../helpers/tokenFA2';
import _taquito from '../helpers/taquito';
import accounts from '../../scripts/sandbox/accounts';
import BigNumber from 'bignumber.js';
import { expect } from 'chai';
import getDelayedISOTime from '../../helpers/getDelayedISOTime';
import { tokenId } from '../helpers/tokenFA2';
import tokenStandard from '../helpers/tokenStandard';

contract('farm contract with penalty enabled', () => {
    let farmContract;
    let lpTokenContract;
    let rewardTokenContract;
    let rewardPerBlock;
    let expectedRewards;
    const balance: any = {};
    const penalty = {
        feePercentage: 5,
        periodSeconds: 84600
    };

    beforeEach(async () => {

        switch (tokenStandard) {
            case "FA12":
                lpTokenContract = await _tokenContractFA12.originate('LP');
                break;
            case "FA2":
                lpTokenContract = await _tokenContractFA2.originate('LP');
                break;
        }
        switch (tokenStandard) {
            case "FA12":
                rewardTokenContract = await _tokenContractFA12.originate('Reward');
                break;
            case "FA2":
                rewardTokenContract = await _tokenContractFA2.originate('Reward');
                break;
        }

        rewardPerBlock = rewardToken(10);
        const totalBlocks = 100000;
        const totalRewards = (new BigNumber(rewardPerBlock)).multipliedBy(totalBlocks);

        const initialStorage = _initialStorageFarm.productionWithPenalty(
            lpTokenContract.instance.address, 
            rewardTokenContract.instance.address,
            rewardPerBlock,
            totalBlocks,
            penalty,
            [],
        );

        if (tokenStandard == "FA2") {
            initialStorage.tokenIds = {
                lp: tokenId,
                reward: tokenId
            };
        }

        farmContract = await _farmContract.originate(initialStorage);

        // give allowance to farm contract to spend on behalf of the address that owns reward tokens
        await _taquito.signAs(accounts.walter.sk, rewardTokenContract, async () => {
            // delegator approves farm contract to do the transfer
            switch (tokenStandard) {
                case "FA12":   
                    await rewardTokenContract.approve(
                        farmContract.instance.address, 
                        totalRewards
                    );
                    break;
                case "FA2":
                    await rewardTokenContract.add_operator(
                        accounts.walter.pkh, 
                        farmContract.instance.address
                    );
                    break;
            }
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

    it.skip('can penalize early withdrawal for one staker', async () => {
        const spender = farmContract.instance.address;
        const depositValue = lpToken(100);
        // alice gives farm contract an allowance
        switch (tokenStandard) {
            case "FA12":   
                await lpTokenContract.approve(
                    spender, 
                    depositValue
                );
                break;
            case "FA2":
                await lpTokenContract.add_operator(
                    accounts.alice.pkh, // owner
                    spender
                );
                break;
        }
        
        await farmContract.deposit(depositValue);
        // withdraws after 5 blocks
        const blocks = 5;
        await _taquito.increaseBlock(blocks);
        await farmContract.withdraw(depositValue);

        
        const expectedDelegatorLp = balance.delegatorLpBefore.multipliedBy(((100 - penalty.feePercentage) / 100)).toFixed()
        balance.delegatorLpAfter = await lpTokenContract.getBalance(accounts.alice.pkh);
        expect(balance.delegatorLpAfter.toFixed()).to.equal(expectedDelegatorLp);
        
        balance.farmLpAfter = await lpTokenContract.getBalance(farmContract.instance.address);
        expect(balance.farmLpAfter.toFixed()).to.equal('0');

        balance.delegatorRewardAfter = await rewardTokenContract.getBalance(accounts.alice.pkh);
        const allRewards = (new BigNumber(rewardPerBlock)).multipliedBy(blocks + 1);
        // only one staker, hence all rewards to her
        const delegatorRewardAfter = balance.delegatorRewardBefore.plus(allRewards);
        expect(balance.delegatorRewardAfter.toFixed()).to.equal(delegatorRewardAfter.toFixed());
    });

    it('deployment helper', async () => {

    })
});