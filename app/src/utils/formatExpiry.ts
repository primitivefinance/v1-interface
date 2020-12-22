import { BigNumberish } from 'ethers'
const formatExpiry = (unixTimestamp: BigNumberish) => {
  const unixDate = new Date(parseInt(unixTimestamp.toString()) * 1000)
  const month = unixDate.getUTCMonth() + 1
  const date = unixDate.getUTCDate()
  const year = unixDate.getUTCFullYear()
  const utc = unixDate.toUTCString()
  return { date, month, year, utc }
}

export default formatExpiry
