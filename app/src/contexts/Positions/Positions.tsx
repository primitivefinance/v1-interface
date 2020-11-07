import React, { useCallback, useReducer } from 'react'
import { formatEther } from 'ethers/lib/utils'

import { useWeb3React } from '@web3-react/core'
import { Pair, Token, TokenAmount, Trade, TradeType, Route } from '@uniswap/sdk'

import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import Option from '@primitivefi/contracts/artifacts/Option.json'
import ERC20 from '@primitivefi/contracts/artifacts/TestERC20.json'

import PositionsContext from './context'
import reducer, { initialState, setPositions } from './reducer'
import { EmptyPositionsAttributes, PositionsAttributes } from './types'

import { Protocol } from '@/lib/protocol'
import { STABLECOINS } from '@/constants/index'
import useTokenBalance from '@/hooks/useTokenBalance'

import { ethers } from 'ethers'

const Positions: React.FC = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Web3 injection
  const { library, chainId, account } = useWeb3React()
  const provider = library

  const handlePosition = useCallback(
    async (optionAddress: string) => {
      // Web3 variables
      const signer = await provider.getSigner()
      const account = await signer.getAddress()

      const optionContract = new ethers.Contract(
        optionAddress,
        Option.abi,
        library
      )
      const redeemAddress = await optionContract.redeemToken()
      const redeem = new Token(chainId, redeemAddress, 18)
      const redeemPair = Pair.getAddress(STABLECOINS[chainId], redeem)
      try {
        const LPAddress = await new ethers.Contract(
          redeemPair,
          IUniswapV2Pair.abi,
          library
        ).address

        dispatch(
          setPositions({
            loading: false,
            long: optionAddress,
            short: redeemAddress,
            LP: LPAddress,
          })
        )
      } catch (error) {
        dispatch(
          setPositions({
            loading: false,
            long: optionAddress,
            short: redeemAddress,
            LP: '',
          })
        )
      }
    },
    [dispatch, provider, setPositions]
  )

  return (
    <PositionsContext.Provider
      value={{
        position: state.position,
        getPosition: handlePosition,
      }}
    >
      {props.children}
    </PositionsContext.Provider>
  )
}

export default Positions
