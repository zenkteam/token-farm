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

contract('%claim', () => {
    let farmContract;
    let penalty = {
        feePercentage: 5,
        periodSeconds: 86400,
    }
    
    describe('one delegator staking', () => {
      
        beforeEach(async () => {
            farmContract = await _farmContract.originate(
                _initialStorage.base()
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

            const setPenaltyConfig = await farmContract.getPenalty();
            expect(setPenaltyConfig).to.equal(penalty);
        });
    });
});
