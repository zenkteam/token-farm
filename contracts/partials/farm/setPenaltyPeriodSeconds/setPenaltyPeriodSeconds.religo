let setPenaltyPeriodSeconds = ((setPenaltyPeriodSecondsParameter, storage): (setPenaltyPeriodSecondsParameter, storage)): entrypointReturn => {
    // permission check for calling this function
    failIfNotAdmin(storage);

    let storage = setPenaltyPeriodSecondsProperty(setPenaltyPeriodSecondsParameter, storage);

    ([]:list(operation), storage);
};
