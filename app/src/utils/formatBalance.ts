import { BigNumberish } from 'ethers'
const formatBalance = (
  tokenBalance: string | number | BigNumberish,
  maximumFractionDig?: number
): BigNumberish => {
  if (typeof tokenBalance === 'number') {
    tokenBalance = tokenBalance.toString()
  }
  if (typeof tokenBalance === 'undefined') {
    return 0
  }
  return parseFloat(tokenBalance.toString()).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maximumFractionDig ? maximumFractionDig : 4,
  })
}

export default formatBalance
