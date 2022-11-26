import type { BigNumber } from "ethers";

export default interface SavingsGoal {
  amount: BigNumber
  timeSpanSeconds: BigNumber
  startDateSeconds: BigNumber
  startBalance: BigNumber
}
