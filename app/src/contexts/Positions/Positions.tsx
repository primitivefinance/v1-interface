import React, { useCallback, useReducer } from 'react'
import { formatEther } from 'ethers/lib/utils'

import { useWeb3React } from '@web3-react/core'
import { Pair, Token, TokenAmount, TradeType, Route } from '@uniswap/sdk'

import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'

import PositionsContext from './context'
import reducer, { initialState, setPositions } from './reducer'
import {
  EmptyPositionAttributes,
  PositionsAttributes,
  OptionPosition,
} from './types'

import { Protocol } from '@/lib/protocol'
import { STABLECOINS } from '@/constants/index'
import useTokenBalance from '@/hooks/useTokenBalance'
import { Trade, Option, Quantity } from '@/lib/entities'
import { getBalance } from '@/lib/erc20'
import { ethers } from 'ethers'
import { OptionsAttributes } from '../Options/types'
import formatEtherBalance from '@/utils/formatEtherBalance'

const Positions: React.FC = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  // Web3 injection
  const { library, account } = useWeb3React()

  const handlePositions = useCallback(
    async (options: OptionsAttributes[]) => {
      // Web3 variables      console.log(options.length)
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
          console.log(positionExists)
          positionsArr.push({
            attributes: options[i],
            long: long,
            redeem: redeem,
            lp: lp,
          })
        }
      }
      dispatch(
        setPositions({
          loading: false,
          exists: positionExists,
          options: positionsArr,
        })
      )
    },
    [dispatch, library, account, setPositions]
  )

  return (
    <PositionsContext.Provider
      value={{
        positions: state.positions,
        getPositions: handlePositions,
      }}
    >
      {props.children}
    </PositionsContext.Provider>
  )
}

export default Positions
