let setAccumulatedRewardPerShare = ((accumulatedRewardPerShare, storage): (nat, storage)): storage => {
    {
        ...storage,
        farm: {
            ...storage.farm,
            accumulatedRewardPerShare: accumulatedRewardPerShare
        }
    };
};

let setLastBlockUpdate = ((blockLevel, storage): (nat, storage)): storage => {
    {
        ...storage,
        farm: {
            ...storage.farm,
            lastBlockUpdate: blockLevel
        }
    };
};

let setPaidRewards = ((paidRewards, storage): (nat, storage)): storage => {
     {
        ...storage,
        farm: {
            ...storage.farm,
            claimedRewards: {
                ...storage.farm.claimedRewards,
                paid: paidRewards
            }
        }
    };
};

let setUnpaidRewards = ((unpaidRewards, storage): (nat, storage)): storage => {
     {
        ...storage,
        farm: {
            ...storage.farm,
            claimedRewards: {
                ...storage.farm.claimedRewards,
                unpaid: unpaidRewards
            }
        } 
    };
};

let setPlannedRewards = ((rewardPerBlock, totalBlocks, storage): (nat, nat, storage)): storage => {
    {
        ...storage,
        farm: {
            ...storage.farm,
            plannedRewards: {
                rewardPerBlock: rewardPerBlock,
                totalBlocks: totalBlocks
            }
        }
    };
};

#if PENALTY
    let setPenalty = ((penalty, storage): (penalty, storage)): storage => {
        {
            ...storage,
            farm: {
                ...storage.farm,
                penalty: penalty
            }
        };
    };
#endif