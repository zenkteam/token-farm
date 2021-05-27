let setPenaltyFeePercent = ((setPenaltyFeePercentParameter, storage): (setPenaltyFeePercentParameter, storage)): entrypointReturn => {
    // permission check for calling this function
    failIfNotAdmin(storage);

    let storage = setPenaltyFeePercentProperty(setPenaltyFeePercentParameter, storage);

    ([]:list(operation), storage);
};
