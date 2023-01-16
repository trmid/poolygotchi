import { BigNumber, ethers } from "ethers";

export const formatUSDC = (amount: BigNumber, round = true) => {
  const str = ethers.utils.formatUnits(amount, 6);
  if(round) {
    const decimalIndex = str.lastIndexOf('.');
    if(decimalIndex >= 0) return str.slice(0, Math.min(decimalIndex + 3, str.length));
  }
  return str;
};