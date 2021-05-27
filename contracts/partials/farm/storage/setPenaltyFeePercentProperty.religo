let setPenaltyFeePercentProperty = ((penaltyFeePercent, storage): (nat, storage)): storage => {
    {
        ...storage,
        farm: {
            ...storage.farm,
            penaltyFeePercent: penaltyFeePercent
        }
    };
};
