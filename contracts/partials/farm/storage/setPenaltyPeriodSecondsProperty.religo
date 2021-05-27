let setPenaltyPeriodSecondsProperty = ((penaltyPeriodSeconds, storage): (nat, storage)): storage => {
    {
        ...storage,
        farm: {
            ...storage.farm,
            penaltyPeriodSeconds: penaltyPeriodSeconds
        }
    };
};
