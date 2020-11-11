import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'

import { OptionPosition } from './reducer'
import { updatePositions } from './actions'

import { useWeb3React } from '@web3-react/core'

import { OptionsAttributes } from '../options/reducer'
import { getBalance } from '@/lib/erc20'

import formatEtherBalance from '@/utils/formatEtherBalance'

export const usePositions = (): ((options: OptionsAttributes[]) => void) => {
  const { library, account } = useWeb3React()
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    async (options: OptionsAttributes[]) => {
      let positionExists = false
      const positionsArr: OptionPosition[] = []

      for (let i = 0; i < options.length; i++) {
        const long = await getBalance(
          library,
          options[i].entity.address,
          account
        )
        const redeem = await getBalance(
          library,
          options[i].entity.assetAddresses[2],
          account
        )
        const lp = await getBalance(library, options[i].entity.pair, account)
        if (
          formatEtherBalance(long) !== '0.00' ||
          formatEtherBalance(redeem) !== '0.00' ||
          formatEtherBalance(lp) !== '0.00'
        ) {
          positionExists = true
          console.log(formatEtherBalance(long))
          console.log(formatEtherBalance(redeem))
          console.log(formatEtherBalance(lp))
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
          options: positionsArr,
        })
      )
    },
    [dispatch, library, account, updatePositions]
  )
}
