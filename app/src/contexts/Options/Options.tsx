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

import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'

import { useWeb3React } from '@web3-react/core'

import OptionsContext from './context'
import optionsReducer, { initialState, setOptions } from './reducer'
import { EmptyAttributes, OptionsAttributes } from './types'

import UniswapV2Router02 from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import { showThrottleMessage } from '@ethersproject/providers'
import { Protocol } from '@/lib/protocol'
import { STABLECOINS } from '@/constants/index'
import { Trade, Option } from '@/lib/entities'

const Options: React.FC = (props) => {
  const [state, dispatch] = useReducer(optionsReducer, initialState)

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

    const OPTION = new Token(chain, optionAddress, 18)
    const UNDERLYING = STABLECOINS[chainId]
    const tokenA = UNDERLYING
    const tokenB = OPTION
    try {
      const address = Pair.getAddress(tokenA, tokenB)
      const [reserves0, reserves1] = await new ethers.Contract(
        address,
        IUniswapV2Pair.abi,
        provider
      ).getReserves()
      const path = [option.assetAddresses[2], option.assetAddresses[0]] // 0 = underlying, 1 = strike ,2 = redeem
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
      // Asset address and quantity of options
      const signer = await provider.getSigner()
      const registry = await Protocol.getRegistry(signer)

      const filter: any = registry.filters.DeployedOptionClone(null, null, null)
      filter.fromBlock = 7200000 // we can set a better start block later
      filter.toBlock = 'latest'

      // Objects and arrays to populate
      const optionsObject = {
        calls: [EmptyAttributes],
        puts: [EmptyAttributes],
        loading: true,
        reservesTotal: 0,
      }
      const calls: OptionsAttributes[] = []
      const puts: OptionsAttributes[] = []

      const pairReserveTotal: BigNumberish = 0
      let breakEven: BigNumberish

      provider.getLogs(filter).then((logs) => {
        const promises = logs.map(async (log) => {
          try {
            const option = await Protocol.getOption(
              chainId,
              registry.interface.parseLog(log).args.optionAddress,
              provider
            )
            const baseAssetSymbol = option.optionParameters.base.asset.symbol
            const quoteAssetSymbol = option.optionParameters.quote.asset.symbol
            switch (assetName.toLowerCase()) {
              case 'eth':
                assetName = 'WETH'
                break
              case 'ether':
                assetName = 'WETH'
                break
              case 'ethereum':
                assetName = 'WETH'
                break
            }
            if (
              baseAssetSymbol !== assetName &&
              quoteAssetSymbol !== assetName
            ) {
              return
            }
            const { premium, reserve } = await getPairData(provider, option)
            if (reserve) BigNumber.from(pairReserveTotal).add(reserve)
            if (option.isCall) {
              breakEven = calculateBreakeven(
                option.strikePrice.quantity,
                premium,
                true
              )
              calls.push({
                asset: '',
                breakEven: breakEven,
                change: 0,
                premium: premium,
                strike: option.strikePrice.quantity,
                volume: 0,
                reserve: reserve,
                address: option.address,
                expiry: option.expiry,
                id: option.name,
              })
            }
            if (option.isPut) {
              breakEven = calculateBreakeven(
                option.strikePrice.quantity,
                premium,
                false
              )
              puts.push({
                asset: '',
                breakEven: breakEven,
                change: 0,
                premium: premium,
                strike: option.strikePrice.quantity,
                volume: 0,
                reserve: reserve,
                address: option.address,
                expiry: option.expiry,
                id: option.name,
              })
            }
            return
          } catch (error) {
            console.error(error)
            return
          }
        })
        Promise.all(promises)
          .then(() => {
            console.log(calls)
            Object.assign(optionsObject, {
              calls: calls,
              puts: puts,
              loading: false,
              reservesTotal: pairReserveTotal,
            })

            dispatch(setOptions(optionsObject))
          })
          .catch((error) => console.error(error))
      })
      /* For each option in the option deployments file...
      for (let i = 0; i < allOptions.length; i++) {
        const opt = allOptions[i]
        const id = i.toString()
        const {
          optionParameters,
          address,
          underlying,
          strike,
          base,
          quote,
          isCall,
          isPut,
          expiry,
        } = opt

        // If the selected asset is not one of the assets in the option, skip it.
        if (underlying.symbol !== assetName && assetName !== strike.symbol) {
          return
        }

        // Initialize the values we need to grab.
        let breakEven = 0
        const change = 0
        let premium = 0
        const strikePrice = 0
        const volume = 0

        // Get the option premium data from uniswap pair.
        const { premium, reserve } = await getPairData(
          provider,
          address,
          underlying
        )
        premium = premium
        const reserveS = reserve
        const reserveL = reserve
        pairReserveTotal += reserve
        // If the base is 1, push to calls array. If quote is 1, push to puts array.
        // If a call, set the strike to the quote. If a put, set the strike to the base.
        let arrayToPushTo: OptionsAttributes[] = []
        if (isCall === true) {
          arrayToPushTo = calls
        }
        if (isPut === true) {
          arrayToPushTo = puts
        }

        breakEven = calculateBreakeven(strike, premium, isCall)

        // Push the option object with the parsed data to the options call or puts array.
        arrayToPushTo.push({
          breakEven: breakEven,
          change: change,
          premium: premium,
          strike: strikePrice,
          volume: volume,
          longReserve: reserveL,
          shortReserve: reserveS,
          address: address,
          id: id,
          expiry: expiry,
        })
      }
      */
      // Get the final options object and dispatch it to set its state for the hook.
    },
    [dispatch, provider, chainId, getPairData]
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
