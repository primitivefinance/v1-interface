import { Web3Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'

import { Token, TokenAmount, Pair, JSBI, ChainId } from '@uniswap/sdk'
import OptionContract from '@primitivefi/contracts/artifacts/Option.json'
import IERC20 from '@uniswap/v2-core/build/IERC20.json'

import { useKeepSWRDataLiveAsBlocksArrive, useContract } from '../utils/index'
import { useActiveWeb3React } from '@/hooks/user'
import useSWR, { responseInterface } from 'swr'
import { ethers } from 'ethers'

import { ADDRESS_ZERO } from '../../constants'
import { DataType } from './index'

function getTokenBalance(
  contract: Contract,
  token: Token
): (address: string) => Promise<TokenAmount> {
  return async (address: string): Promise<TokenAmount> =>
    contract
      .balanceOf(address)
      .then(
        (balance: { toString: () => string }) =>
          new TokenAmount(token, balance.toString())
      )
}

export function useBalance(
  library: Web3Provider,
  account: string,
  token?: Token,
  address?: string | null,
  suspense = false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): responseInterface<TokenAmount, any> {
  const contract = useContract(token?.address, IERC20.abi)

  const result = useSWR(
    typeof address === 'string' && token && contract
      ? [address, token.chainId, token.address, DataType.TokenBalance]
      : null,
    getTokenBalance(contract as Contract, token as Token),
    { suspense }
  )
  useKeepSWRDataLiveAsBlocksArrive(result.mutate)
  return result
}
