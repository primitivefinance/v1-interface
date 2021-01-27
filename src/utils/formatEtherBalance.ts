import { BigNumberish } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import numeral from 'numeral'
const formatEtherBalance = (
  tokenBalance: string | number | BigNumberish,
  digits?: number
): BigNumberish => {
  if (typeof tokenBalance === 'number') {
    tokenBalance = tokenBalance.toString()
  }
  if (typeof tokenBalance === 'undefined') {
    return 0
  }
  return parseFloat(formatEther(tokenBalance)).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits ? digits : 4,
  })
}

export default formatEtherBalance
