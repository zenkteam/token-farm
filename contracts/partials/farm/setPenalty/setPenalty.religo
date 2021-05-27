let setPenalty = ((setPenaltyParameter, storage): (setPenaltyParameter, storage)): entrypointReturn => {
    // permission check for calling this function
    failIfNotAdmin(storage);

    let storage = setPenaltyProperty(setPenaltyParameter, storage);

    ([]:list(operation), storage);
};
