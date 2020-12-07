import { BigNumberish, BigNumber } from 'ethers'

const isZero = (value: BigNumberish): boolean => {
  if (value === null || value === undefined) return true
  const parsedValue: BigNumber = BigNumber.from(value)
  return parsedValue.isZero()
}

export default isZero
