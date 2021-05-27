#include "deposit/parameter.religo"
#include "claim/parameter.religo"
#include "withdraw/parameter.religo"
#include "updatePlan/parameter.religo"
#include "setAdmin/parameter.religo"
#include "setProperty/parameter.religo"
#include "escape/parameter.religo"
#include "withdrawProfit/parameter.religo"

type parameter = 
    | Deposit(depositParameter)
    | Claim(claimParameter)
    | Withdraw(withdrawParameter)
    | WithdrawProfit(withdrawProfitParameter)
    | UpdatePlan(updatePlanParameter)
    | SetAdmin(setAdminParameter)
    | SetProperty(setPropertyParameter)
    | Escape(escapeParameter);
