import React, { useCallback, useReducer } from 'react'
import ethers from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { Pair, Token, TokenAmount, Trade, TradeType, Route } from '@uniswap/sdk'

import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import Option from '@primitivefi/contracts/artifacts/Option.json'

import { getOptionMarkets, getRegistry } from '@/lib/primitive'
import { useWeb3React } from '@web3-react/core'

import OptionsContext from './context'
import optionsReducer, { initialState, setOptions } from './reducer'
import { EmptyAttributes, OptionsAttributes } from './types'

import OptionDeployments from './options_deployments.json'
import AssetAddresses from './assets.json'
import UniswapV2Router02 from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import { showThrottleMessage } from '@ethersproject/providers'
import { Protocol } from '@/lib/protocol'
import { STABLECOINS } from '@/constants/index'

const Options: React.FC = (props) => {
  const [state, dispatch] = useReducer(optionsReducer, initialState)

  // Web3 injection
  const { library, chainId } = useWeb3React()
  const provider = library

  /**
   * @dev Calculates the breakeven asset price depending on if the option is a call or put.
   * @param strike The strike price of the option.
   * @param price The current price of the option.
   * @param isCall If the option is a call, if not a call, its a put.
   */
  const calculateBreakeven = (strike, price, isCall) => {
    let breakeven
    if (isCall) {
      breakeven = price + strike
    } else {
      breakeven = price + strike
    }
    return Number(breakeven)
  }

  /**
   * @dev Gets the execution price for 1 unit of option tokens and returns it.
   * @param optionAddress The address of the option token to get a uniswap pair of.
   */
  const getPairData = useCallback(async (provider, optionAddress) => {
    let premium = 0

    // Check to make sure we are connected to a web3 provider.
    if (!provider) {
      console.error('No connected connectedProvider')
      return { premium }
    }
    const chain = chainId

    const OPTION = new Token(chain, optionAddress, 18)
    const UNDERLYING = STABLECOINS[chainId]

    // Fetcher currently calls default provider, which leads to post errors.
    //const pair = await Fetcher.fetchPairData(STABLECOIN, OPTION)

    const tokenA = UNDERLYING
    const tokenB = OPTION
    try {
      const address = Pair.getAddress(tokenA, tokenB)

      const [reserves0, reserves1] = await new ethers.Contract(
        address,
        IUniswapV2Pair.abi,
        provider
      ).getReserves()
      const balances = tokenA.sortsBefore(tokenB)
        ? [reserves0, reserves1]
        : [reserves1, reserves0]
      const pair = new Pair(
        new TokenAmount(tokenA, balances[0]),
        new TokenAmount(tokenB, balances[1])
      )

      const route = new Route([pair], UNDERLYING, OPTION)
      const midPrice = Number(route.midPrice.toSignificant(6))

      const unit = parseEther('1').toString()
      const tokenAmount = new TokenAmount(OPTION, unit)
      const trade = new Trade(route, tokenAmount, TradeType.EXACT_OUTPUT)

      const executionPrice = Number(trade.executionPrice.toSignificant(6))

      const reserve =
        Number(pair.reserve1.numerator) / Number(pair.reserve1.denominator)

      premium = executionPrice > midPrice ? executionPrice : midPrice

      return { premium, reserve }
    } catch {
      const pre = 0
      const def = 0
      return { pre, def }
    }
  }, [])
  // FIX
  const handleOptions = useCallback(
    async (assetName) => {
      // Asset address and quantity of options
      const signer = await provider.getSigner()
      const registry = await getRegistry(signer)

      const filter = registry.filters.DeployedOptionClone(null, null, null)
      filter.fromBlock = 7200000 // we can set a better start block later
      filter.toBlock = 'latest'

      // Objects and arrays to populate
      const optionsObject = {
        calls: [EmptyAttributes],
        puts: [EmptyAttributes],
        reservesTotal: 0,
      }
      const calls: OptionsAttributes[] = []
      const puts: OptionsAttributes[] = []

      let pairReserveTotal = 0

      provider.getLogs(filter).then((logs) => {
        const promises = logs.map(async (log) => {
          try {
            const option = await Protocol.getOption(
              chainId,
              registry.interface.parseLog(log).args.optionAddress,
              provider
            )
            if (option.optionParameters.base.asset.symbol !== assetName) return
            const { premium, reserve } = await getPairData(
              provider,
              option.address
            )
            pairReserveTotal += reserve
            if (!option.isCall) {
              calls.push({
                breakEven: 0,
                change: 0,
                price: 0,
                strike: option.strikePrice.quantity,
                volume: 0,
                reserve: 0,
                address: option.address,
                expiry: option.expiry,
                id: option.name,
              })
            }
            if (!option.isPut) {
              puts.push({
                breakEven: 0,
                change: 0,
                price: 0,
                strike: option.strikePrice.quantity,
                volume: 0,
                reserve: 0,
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
        let price = 0
        const strikePrice = 0
        const volume = 0

        // Get the option price data from uniswap pair.
        const { premium, reserve } = await getPairData(
          provider,
          address,
          underlying
        )
        price = premium
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

        breakEven = calculateBreakeven(strike, price, isCall)

        // Push the option object with the parsed data to the options call or puts array.
        arrayToPushTo.push({
          breakEven: breakEven,
          change: change,
          price: price,
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
