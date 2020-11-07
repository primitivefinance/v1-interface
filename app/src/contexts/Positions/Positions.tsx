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

import { ethers } from 'ethers'
import { OptionsAttributes } from '../Options/types'

const Positions: React.FC = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  // Web3 injection
  const { library, chainId, account } = useWeb3React()
  const provider = library

  const handlePositions = useCallback(
    async (options: OptionsAttributes[]) => {
      // Web3 variables
      console.log(options)
      const positionExists = true
      const positionsArr: OptionPosition[] = []

      for (let i = 0; i < options.length; i++) {
        console.log(options[i])
        positionsArr.push({
          entity: options[i].entity,
          asset: options[i].asset,
          strike: options[i].strike,
          address: options[i].address,
          long: 0,
          redeem: 0,
          lp: 0,
        })
      }
      console.log(options)
      dispatch(
        setPositions({
          loading: false,
          exists: positionExists,
          options: positionsArr,
        })
      )
    },
    [dispatch, setPositions]
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
