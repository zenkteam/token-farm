#include "../helpers/subtraction.religo"

let withdraw = ((withdrawParameter, storage): (withdrawParameter, storage)): entrypointReturn => {
    let storage = updatePool(storage);
    
    let (rewardTokenTransferOperationList, storage) = claim(storage);
    
    let delegator = Tezos.sender;
    let delegatorRecord = getDelegator(delegator, storage);
    
    let storage = decreaseDelegatorBalance(delegator, withdrawParameter, storage);
    // Allow the payoutAmount to differ from the initial withdrawParameter
    let payoutAmount = withdrawParameter;

#if PENALTY
    let lockingPeriod = delegator.lastUpdate + storage.farm.penalty.periodSeconds;
    let penaltyDue = Tezos.now > lockingPeriod;
    payoutAmount = switch (penaltyDue) {
        | true => subtractPercentage(payoutAmount, storage.farm.penalty.feePercentage)
        | false => payoutAmount
    }
#endif

    let farmLpTokenBalance = safeBalanceSubtraction(storage.farmLpTokenBalance, payoutAmount); 
    let storage = setFarmLpTokenBalance(farmLpTokenBalance, storage);

    let lpTokenTransferOperation = transfer(
        Tezos.self_address, // from
        delegator, // to 
        payoutAmount, // value
#if TOKEN_FA2
        storage.tokenIds.lp, // tokenId
#endif
        storage.addresses.lpTokenContract
    );
   
    ([lpTokenTransferOperation, ...rewardTokenTransferOperationList]: list(operation), storage);
};
