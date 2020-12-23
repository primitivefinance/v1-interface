import BigNumber from 'bignumber.js'

export { default as formatAddress } from './formatAddress'
export { tryParseAmount } from './tryParseAmount'

export const bnToDec = (bn: BigNumber, decimals = 18) => {
  return bn.dividedBy(new BigNumber(10).pow(decimals)).toNumber()
}

export const decToBn = (dec: number, decimals = 18) => {
  return new BigNumber(dec).multipliedBy(new BigNumber(10).pow(decimals))
}
// 10% gas margin
export const calculateGasMargin = (value: BigNumber): BigNumber => {
  return value
    .multipliedBy(new BigNumber(10000).plus(new BigNumber(1000)))
    .div(new BigNumber(10000))
}

export const CHAIN_ID_NAMES: { [key: number]: string } = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Görli',
  42: 'Kovan',
}

export const INFURA_PREFIXES: { [key: number]: string } = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli',
  42: 'kovan',
}
