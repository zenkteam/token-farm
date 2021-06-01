type delegator = address;
type delegatorRecord = {
    accumulatedRewardPerShareStart: nat,
    lpTokenBalance: nat,
#if PENALTY
    lastUpdate: timestamp,
#endif
};

type getBalanceParameter = 
[@layout:comb]
{
    owner: address,
    callback: contract(nat),
};

type getBalanceResponse = nat;

#if TOKEN_FA2
type transferContents = 
[@layout:comb]
{
    to_: address,
    token_id: nat,
    amount: nat
};

type transfer = 
[@layout:comb]
{
    from_: address,
    txs: list(transferContents)
};

type transferParameter = list(transfer);
#else
type transferParameter = 
[@layout:comb]
{
    [@annot:from] from_: address,
    [@annot:to] to_: address,
    value: nat,
};
#endif

type updatePoolAction = Skip | UpdateBlock | UpdateRewards;

type claimedRewards = {
    unpaid: nat,
    paid: nat,
};

type plannedRewards = {
    rewardPerBlock: nat,
    totalBlocks: nat,
};

type penalty = {
    feePercentage: nat,
    periodSeconds: int,
};

type farm = {
    accumulatedRewardPerShare: nat,
    claimedRewards: claimedRewards,
    lastBlockUpdate: nat,
    plannedRewards: plannedRewards,
#if PENALTY
    penalty: penalty,
#endif
};

type addresses = {
    admin: address,
    lpTokenContract: address,
    rewardReserve: address,
    rewardTokenContract: address,
};

#if TOKEN_FA2
type tokenId = nat;
type tokenIds = {
    lp: tokenId,
    reward: tokenId,
};
#endif
