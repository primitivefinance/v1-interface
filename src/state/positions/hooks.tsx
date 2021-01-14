import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'

import { OptionPosition } from './reducer'
import { updatePositions, setLoading, clearPositions } from './actions'

import { useWeb3React } from '@web3-react/core'
import { useOptions } from '@/state/options/hooks'

import { OptionsAttributes } from '../options/actions'
import { getBalance } from '@/lib/erc20'
import formatEtherBalance from '@/utils/formatEtherBalance'
import { TokenAmount } from '@uniswap/sdk'

export const usePositions = (): {
  loading: boolean
  exists: boolean
  balance: TokenAmount
  options: OptionPosition[]
} => {
  const state = useSelector<AppState, AppState['positions']>(
    (state) => state.positions
  )
  return state
}

export const useClearPositions = (): (() => void) => {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(() => {
    dispatch(clearPositions())
  }, [dispatch])
}

export const useSetLoading = (): (() => void) => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => {
    dispatch(setLoading())
  }, [dispatch])
}
export const useUpdatePositions = (): ((
  options: OptionsAttributes[]
) => void) => {
  const { library, account } = useWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    async (options: OptionsAttributes[]) => {
      let positionExists = false
      const positionsArr: OptionPosition[] = []
      if (options.length === 0) {
        dispatch(
          updatePositions({
            loading: false,
            exists: false,
            balance: null,
            options: positionsArr,
          })
        )
        return
      }
      const bal = await getBalance(
        library,
        options[0].entity.underlying.address,
        account
      )

      const balance = new TokenAmount(
        options[0].entity.underlying,
        bal ? bal.toString() : '0'
      )
      // underlying balance

      for (let i = 0; i < options.length; i++) {
        const long = await getBalance(
          library,
          options[i].entity.address,
          account
        )

        const redeem = await getBalance(
          library,
          options[i].entity.redeem.address,
          account
        )

        const lp = await getBalance(
          library,
          options[i].entity.pairAddress,
          account
        )
        if (
          formatEtherBalance(long) !== '0.00' ||
          formatEtherBalance(redeem) !== '0.00' ||
          formatEtherBalance(lp) !== '0.00'
        ) {
          positionExists = true
          positionsArr.push({
            attributes: options[i],
            long: long,
            redeem: redeem,
            lp: lp,
          })
        }
      }
      dispatch(
        updatePositions({
          loading: false,
          exists: positionExists,
          balance: balance,
          options: positionsArr,
        })
      )
    },
    [dispatch, library, account, updatePositions]
  )
}
