#if PENALTY
let setPenaltyProperty = ((penalty, storage): (penalty, storage)): storage => {
    {
        ...storage,
        farm: {
            ...storage.farm,
            penalty: penalty
        }
    };
};
#endif
