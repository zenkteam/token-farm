/**
 * Emergency withdraw function called escape is an extra layer of protection
 * for delegators. Do not call this except the farm encounters a critical bug.
 */
let escape = ((escapeParameter, storage): (escapeParameter, storage)): entrypointReturn => {
    let delegator = Tezos.sender;
    let delegatorRecord = getDelegator(delegator, storage);
    let escapingBalance = delegatorRecord.lpTokenBalance;

    let operationsList: list(operation) = [];
#if PENALTY
    let lockingPeriod = delegatorRecord.lastUpdate + storage.farm.penalty.periodSeconds;
    let penaltyDue = Tezos.now < lockingPeriod;
    let escapingBalance = switch (penaltyDue) {
        | true => subtractPercentage(escapingBalance, storage.farm.penalty.feePercentage)
        | false => escapingBalance
    };
    
    let lpPenaltyTokenTransferOperation = transfer(
        Tezos.self_address, // from
        storage.addresses.penaltyPayoutAddress, // to
        safeBalanceSubtraction(delegatorRecord.lpTokenBalance, escapingBalance), // value
#if TOKEN_FA2
        storage.tokenIds.lp, // tokenId
#endif
        storage.addresses.lpTokenContract        
    );
    let operationsList = [lpPenaltyTokenTransferOperation];
#endif

    // update farm's LP token balance
    let farmLpTokenBalance = safeBalanceSubtraction(storage.farmLpTokenBalance, delegatorRecord.lpTokenBalance); 
    let storage = setFarmLpTokenBalance(farmLpTokenBalance, storage);
    // remove delegator after successfully updating internal LP farm ledger
    let storage = removeDelegator(delegator, storage);

    // transfer LP token
    let lpTokenTransferOperation = transfer(
        Tezos.self_address, // from
        delegator, // to 
        escapingBalance, // value
#if TOKEN_FA2
        storage.tokenIds.lp, // tokenId
#endif
        storage.addresses.lpTokenContract
    );
    
    ([lpTokenTransferOperation, ...operationsList]: list(operation), storage);
};
