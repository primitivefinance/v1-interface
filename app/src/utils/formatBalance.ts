import { BigNumberish } from 'ethers'
const formatBalance = (
  tokenBalance: string | number | BigNumberish
): BigNumberish => {
  if (typeof tokenBalance === 'number') {
    tokenBalance = tokenBalance.toString()
  }
  if (typeof tokenBalance === 'undefined') {
    return 0
  }
  return parseFloat(tokenBalance.toString()).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default formatBalance
