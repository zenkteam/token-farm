import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

import { TezosOperationError } from '@taquito/taquito';
import accounts from '../../../scripts/sandbox/accounts';
import { contractErrors } from '../../../helpers/constants';
import _tokenContract from '../../helpers/token';
import _taquito from '../../helpers/taquito';
import _farmContract from '../../helpers/farm';
import _initialStorage from '../../../migrations/initialStorage/farm';
import flavor from '../../helpers/flavor';
import tokenStandard from '../../helpers/tokenStandard';

contract('%setPenalty', () => {
    let farmContract;
    let penalty = {
        feePercentage: 5,
        periodSeconds: 86400,
    };
    
    if (flavor === 'penalty') {
        describe('one delegator staking', () => {
      
            beforeEach(async () => {
                const initialStorage = _initialStorage.baseWithPenalty();
                
                if (tokenStandard == "FA2") {
                    initialStorage.tokenIds = {
                        lp: 0,
                        reward: 0
                    };
                };
                farmContract = await _farmContract.originate(
                    initialStorage
                );
            });
    
            it('fails for a third party to %setPenalty', async () => {
                await _taquito.signAs(accounts.chuck.sk, farmContract, async () => {
                    const operationPromise = farmContract.setPenalty(penalty);
                    
                    await expect(operationPromise).to.be.eventually.rejected
                        .and.be.instanceOf(TezosOperationError)
                        .and.have.property('message', contractErrors.senderIsNotAdmin)
                });
            });
    
            it('sets new penalty config', async () => {
                await farmContract.setPenalty(penalty);
    
                const penaltyRecord = await farmContract.getPenalty();
                const feePercentage = penaltyRecord.feePercentage.toNumber();
                const periodSeconds = penaltyRecord.periodSeconds.toNumber();
                expect({feePercentage, periodSeconds}).to.deep.equal(penalty);
            });
        });
    }
});
