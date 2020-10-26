export enum DataType {
  BlockNumber,
  ETHBalance,
  TokenBalance,
  TokenAllowance,
  Reserves,
  Token,
  RemoteTokens,
}

export { useETHBalance } from './useETHBalance'
export { useBlockNumber } from './useBlockNumber'
export { usePriceAPI } from './usePriceAPI'
export { useBalance } from './useBalances'
