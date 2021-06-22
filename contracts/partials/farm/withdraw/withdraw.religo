#include "../helpers/subtraction.religo"

let withdraw = ((withdrawParameter, storage): (withdrawParameter, storage)): entrypointReturn => {
    let storage = updatePool(storage);
    
    let (rewardTokenTransferOperationList, storage) = claim(storage);
    let operationsList: list(operation) = rewardTokenTransferOperationList;
    
    let delegator = Tezos.sender;
    let delegatorRecord = getDelegator(delegator, storage);
    
    // Allow the lpPayoutAmount to differ from the initial withdrawParameter
    let lpPayoutAmount = withdrawParameter;

#if PENALTY
    let lockingPeriod = delegatorRecord.lastUpdate + storage.farm.penalty.periodSeconds;
    let penaltyDue = Tezos.now < lockingPeriod;
    let lpPayoutAmount = switch (penaltyDue) {
        | true => subtractPercentage(lpPayoutAmount, storage.farm.penalty.feePercentage)
        | false => lpPayoutAmount
    };

    let lpPenaltyTokenTransferOperation = transfer(
        Tezos.self_address, // from
        storage.addresses.penaltyPayoutAddress, // to
        safeBalanceSubtraction(withdrawParameter, lpPayoutAmount), // value
#if TOKEN_FA2
        storage.tokenIds.lp, // tokenId
#endif
        storage.addresses.lpTokenContract        
    );
    let operationsList = [lpPenaltyTokenTransferOperation, ...operationsList];
#endif
    let storage = decreaseDelegatorBalance(delegator, lpPayoutAmount, storage);

    let farmLpTokenBalance = safeBalanceSubtraction(storage.farmLpTokenBalance, lpPayoutAmount); 
    let storage = setFarmLpTokenBalance(farmLpTokenBalance, storage);

    let lpTokenTransferOperation = transfer(
        Tezos.self_address, // from
        delegator, // to 
        lpPayoutAmount, // value
#if TOKEN_FA2
        storage.tokenIds.lp, // tokenId
#endif
        storage.addresses.lpTokenContract
    );

    ([lpTokenTransferOperation, ...operationsList]: list(operation), storage);
};
