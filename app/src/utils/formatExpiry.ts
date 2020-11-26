import { BigNumberish } from 'ethers'
const formatExpiry = (unixTimestamp: BigNumberish) => {
  const unixDate = new Date(parseInt(unixTimestamp.toString()) * 1000)
  const month = unixDate.getUTCMonth() + 1
  const date = unixDate.getUTCDate()
  const year = unixDate.getUTCFullYear()
  return { date, month, year }
}

export default formatExpiry
