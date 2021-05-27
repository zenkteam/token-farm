#include "../helpers/subtraction.religo"

let withdraw = ((withdrawParameter, storage): (withdrawParameter, storage)): entrypointReturn => {
    let storage = updatePool(storage);
    
    let (rewardTokenTransferOperationList, storage) = claim(storage);
    
    let delegator = Tezos.sender;
    let delegatorRecord = getDelegator(delegator, storage);
    
    let storage = decreaseDelegatorBalance(delegator, withdrawParameter, storage);
    // Allow the payoutAmount to differ from the initial withdrawParameter
    let payoutAmount = withdrawParameter;

#if LOCK
    let lockingPeriod = delegator.lastUpdate + storage.farm.penaltyPeriodSeconds;
    if( Tezos.now > lockingPeriod ){
        payoutAmount = withdrawParameter * safeBalanceSubtraction(100, storage.farm.penaltyFeePercent) / 100;    
    }
#endif

    let farmLpTokenBalance = safeBalanceSubtraction(storage.farmLpTokenBalance, payoutAmount); 
    let storage = setFarmLpTokenBalance(farmLpTokenBalance, storage);

    let lpTokenTransferOperation = transfer(
        Tezos.self_address, // from
        delegator, // to 
        payoutAmount, // value
        storage.addresses.lpTokenContract
    );
   
    ([lpTokenTransferOperation, ...rewardTokenTransferOperationList]: list(operation), storage);
};
