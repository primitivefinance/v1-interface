import { BigNumberish } from 'ethers'
const formatExpiry = (unixTimestamp: BigNumberish) => {
  const unixDate = new Date(parseInt(unixTimestamp.toString()) * 1000)
  const month = unixDate.getUTCMonth() + 1
  const date = unixDate.getUTCDate()
  const year = unixDate.getUTCFullYear()
  const utc = unixDate.toUTCString()
  const time = unixDate.getUTCHours()
  return { unixDate, date, month, year, utc, time }
}

export default formatExpiry
