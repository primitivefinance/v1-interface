import { BigNumberish } from 'ethers'
const formatBalance = (
  tokenBalance: string | number | BigNumberish
): string => {
  if (typeof tokenBalance === 'number') {
    tokenBalance = tokenBalance.toString()
  }
  return parseFloat(tokenBalance.toString()).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default formatBalance
