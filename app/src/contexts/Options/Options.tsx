import React, { useCallback, useReducer } from 'react'
import ethers, { BigNumberish, BigNumber } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import {
  Pair,
  Token,
  TokenAmount,
  /* Trade,  */ TradeType,
  Route,
} from '@uniswap/sdk'

import { useWeb3React } from '@web3-react/core'

import OptionsContext from './context'
import reducer, { initialState, setOptions } from './reducer'
import { EmptyAttributes, OptionsAttributes } from './types'

import { showThrottleMessage } from '@ethersproject/providers'
import { Protocol } from '@/lib/protocol'
import { STABLECOINS, UNI_ROUTER_ADDRESS } from '@/constants/index'
import { Trade, Option } from '@/lib/entities'
import MultiCall from '@/lib/multicall'
import { Quantity } from '../../lib/entities/quantity'

const Options: React.FC = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  // Web3 injection
  const { library, chainId } = useWeb3React()
  const provider = library

  /**
   * @dev Calculates the breakeven asset premium depending on if the option is a call or put.
   * @param strike The strike premium of the option.
   * @param premium The current premium of the option.
   * @param isCall If the option is a call, if not a call, its a put.
   */
  const calculateBreakeven = (
    strike: BigNumberish,
    premium: BigNumberish,
    isCall: boolean
  ): BigNumberish => {
    let breakeven
    if (isCall) {
      breakeven = BigNumber.from(premium).add(strike)
    } else {
      breakeven = BigNumber.from(strike).sub(premium)
    }
    return Number(breakeven)
  }

  /* const getOptionParametersFromMulticall = useCallback(
    async (provider, optionMapAddresses) => {
      // Check to make sure we are connected to a web3 provider.
      if (!provider) {
        console.error('No connected connectedProvider')
        return { 0 }
      }

      const multi = new MultiCall(provider);
  const inputs = [];
  for (let option of tokens) {
    inputs.push({ target: tokenMapAddress, function: 'getTokenData', args: [token] });
  }
  const tokenDatas = await multi.multiCall(abi, inputs);
      const chain = chainId

      const parameters = {}

      try {
        return { parameters }
      } catch {
        return { parameters }
      }
    },
    []
  ) */

  /**
   * @dev Gets the execution premium for 1 unit of option tokens and returns it.
   * @param option The address of the option token to get a uniswap pair of.
   */
  const getPairData = useCallback(async (provider, option: Option) => {
    const optionAddress = option.address
    const parameters = option.optionParameters
    const base = parameters.base.quantity
    const quote = parameters.quote.quantity
    let premium: BigNumberish = 0

    // Check to make sure we are connected to a web3 provider.
    if (!provider) {
      console.error('No connected connectedProvider')
      return { premium }
    }
    const chain = chainId
    const signer = provider.getSigner()
    const REDEEM = new Token(chain, option.assetAddresses[2], 18)
    const UNDERLYING = new Token(chain, option.assetAddresses[0], 18)

    const tokenA = UNDERLYING
    const tokenB = REDEEM
    try {
      const address = Pair.getAddress(tokenA, tokenB)
      console.log(address)

      const UniswapRouter = new ethers.Contract(
        UNI_ROUTER_ADDRESS,
        IUniswapV2Router.abi,
        provider
      )
      const Factory = new ethers.Contract(
        await UniswapRouter.factory(),
        IUniswapV2Factory.abi,
        provider
      )
      const Pair = new ethers.Contract(address, IUniswapV2Pair.abi, provider)
      const path = [option.assetAddresses[2], option.assetAddresses[0]] // 0 = underlying, 1 = strike ,2 = redeem

      const { reserves0, reserves1 } = await Pair.getReserves()
      console.log(reserves0)
      premium = Trade.getSpotPremium(base, quote, path, [reserves0, reserves1])
      const balances = tokenA.sortsBefore(tokenB)
        ? [reserves0, reserves1]
        : [reserves1, reserves0]
      const pair = new Pair(
        new TokenAmount(tokenA, balances[0]),
        new TokenAmount(tokenB, balances[1])
      )

      let reserve =
        Number(pair.reserve1.numerator) / Number(pair.reserve1.denominator)

      if (typeof reserve === 'undefined') {
        reserve = 0
      }

      if (typeof premium === 'undefined') {
        premium = 0
      }

      return { premium, reserve }
    } catch {
      const premium = 0
      const reserve = 0
      return { premium, reserve }
    }
  }, [])
  // FIX
  const handleOptions = useCallback(
    async (assetName) => {
      // Objects and arrays to populate

      const calls: OptionsAttributes[] = []
      const puts: OptionsAttributes[] = []

      const pairReserveTotal: BigNumberish = 0
      Protocol.getAllOptionClones(provider)
        .then((optionAddresses) => {
          Protocol.getOptionsUsingMultiCall(chainId, optionAddresses, provider)
            .then((optionEntitiesObject) => {
              let breakEven: BigNumberish
              const allKeys: string[] = Object.keys(optionEntitiesObject)

              for (let i = 0; i < allKeys.length; i++) {
                const key = allKeys[i]
                const option = optionEntitiesObject[key]
                const baseAssetSymbol =
                  option.optionParameters.base.asset.symbol
                const quoteAssetSymbol =
                  option.optionParameters.quote.asset.symbol
                getPairData(provider, option)
                  .then(({ premium, reserve }) => {
                    if (reserve !== 0)
                      BigNumber.from(pairReserveTotal).add(reserve)
                    if (option.isCall) {
                      if (baseAssetSymbol === assetName) {
                        breakEven = calculateBreakeven(
                          option.strikePrice.quantity,
                          premium,
                          true
                        )
                        calls.push({
                          asset: assetName,
                          breakEven: breakEven,
                          change: 0,
                          premium: premium,
                          strike: option.strikePrice.quantity,
                          volume: 0,
                          depth: 0,
                          reserve: reserve,
                          address: option.address,
                          underlyingAddress: option.assetAddresses[0],
                          expiry: option.expiry,
                          id: option.name,
                        })
                      }
                    }
                    if (option.isPut) {
                      if (quoteAssetSymbol === assetName) {
                        breakEven = calculateBreakeven(
                          option.strikePrice.quantity,
                          premium,
                          false
                        )

                        const denominator = ethers.BigNumber.from(
                          option.optionParameters.quote.quantity
                        )
                        const numerator = ethers.BigNumber.from(
                          option.optionParameters.base.quantity
                        )
                        const strikePrice = new Quantity(
                          option.base,
                          numerator.div(denominator)
                        )
                        puts.push({
                          asset: assetName,
                          breakEven: breakEven,
                          change: 0,
                          premium: premium,
                          strike: strikePrice.quantity, //strikePrice does not properly return put strike
                          volume: 0,
                          reserve: reserve,
                          depth: 0,
                          address: option.address,
                          underlyingAddress: option.assetAddresses[0],
                          expiry: option.expiry,
                          id: option.name,
                        })
                      }
                    }
                  })
                  .catch((error) => console.log(error))
              }
              dispatch(
                setOptions({
                  loading: false,
                  calls: calls,
                  puts: puts,
                  reservesTotal: pairReserveTotal,
                })
              )
            })
            .catch((error) => console.log(error))
        })
        .catch((error) => console.log(error))
    },
    [dispatch, provider, chainId, setOptions, getPairData]
  )

  return (
    <OptionsContext.Provider
      value={{
        options: state.options,
        getOptions: handleOptions,
      }}
    >
      {props.children}
    </OptionsContext.Provider>
  )
}

export default Options
