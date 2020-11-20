import { useCallback, useEffect, useState } from 'react'
import ethers, { BigNumber } from 'ethers'
import { Operation } from '../constants'

const useGuardCap = (orderType: Operation): BigNumber => {
  let cap: string
  switch (orderType) {
    case Operation.ADD_LIQUIDITY:
      cap = '15000'
      break
    default:
      cap = '10000'
      break
  }
  return ethers.utils.parseEther(cap)
}
export default useGuardCap
