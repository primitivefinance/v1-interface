import React, { useCallback, useReducer } from 'react'
import ethers, { BigNumberish, BigNumber } from 'ethers'
import { Pair, Token } from '@uniswap/sdk'

import { useWeb3React } from '@web3-react/core'
import OptionsContext from './context'
import reducer, { initialState, setOptions } from './reducer'
import { OptionsAttributes } from '../Options/types'

import { Protocol } from '@/lib/protocol'
import { Trade, Option, Quantity } from '@/lib/entities'

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

  // FIX
  const handleOptions = useCallback(
    async (assetName) => {
      // Objects and arrays to populate

      const calls: OptionsAttributes[] = []
      const puts: OptionsAttributes[] = []

      const pairReserveTotal: BigNumberish = 0
      Protocol.getAllOptionClones(provider)
        .then(async (optionAddresses) => {
          Protocol.getOptionsUsingMultiCall(chainId, optionAddresses, provider)
            .then((optionEntitiesObject) => {
              let breakEven: BigNumberish
              const allKeys: string[] = Object.keys(optionEntitiesObject)
              const allPairAddresses: string[] = []
              for (let i = 0; i < allKeys.length; i++) {
                const key: string = allKeys[i]
                const option: Option = optionEntitiesObject[key]
                const SHORT_OPTION: Token = new Token(
                  chainId,
                  option.assetAddresses[2],
                  18
                )
                const UNDERLYING: Token = new Token(
                  chainId,
                  option.assetAddresses[0],
                  18
                )
                const address: string = Pair.getAddress(
                  UNDERLYING,
                  SHORT_OPTION
                )
                allPairAddresses.push(address)
              }
              Protocol.getReservesFromMultiCall(provider, allPairAddresses)
                .then((allReservesData) => {
                  for (let i = 0; i < allKeys.length; i++) {
                    const key: string = allKeys[i]
                    const option: Option = optionEntitiesObject[key]
                    const pair: string = allPairAddresses[i]

                    let reserves: string[] = allReservesData[i]
                    const path: string[] = [
                      option.assetAddresses[2],
                      option.assetAddresses[0],
                    ]
                    if (typeof reserves === 'undefined') reserves = ['0', '0']
                    const reserves0: BigNumberish = reserves[0]
                    const reserves1: BigNumberish = reserves[1]
                    const Base: Quantity = option.optionParameters.base
                    const Quote: Quantity = option.optionParameters.quote

                    let premium: BigNumberish = Trade.getSpotPremium(
                      Base.quantity,
                      Quote.quantity,
                      path,
                      [reserves0, reserves1]
                    )
                    let reserve: BigNumberish = reserves1.toString()

                    if (typeof reserve === 'undefined') reserve = 0
                    if (typeof premium === 'undefined') premium = 0

                    if (reserve) BigNumber.from(pairReserveTotal).add(reserve)
                    if (option.isCall) {
                      if (
                        Base.asset.symbol.toUpperCase() ===
                        assetName.toUpperCase()
                      ) {
                        breakEven = calculateBreakeven(
                          option.strikePrice.quantity,
                          premium,
                          true
                        )
                        calls.push({
                          entity: option,
                          asset: assetName,
                          breakEven: breakEven,
                          change: 0,
                          premium: premium,
                          strike: option.strikePrice.quantity,
                          volume: 0,
                          reserves: reserves,
                          reserve: reserve,
                          depth: 0,
                          address: option.address,
                          expiry: option.expiry,
                          id: option.name,
                        })
                      }
                    }
                    if (option.isPut) {
                      if (
                        Quote.asset.symbol.toUpperCase() ===
                        assetName.toUpperCase()
                      ) {
                        const denominator = ethers.BigNumber.from(
                          option.optionParameters.quote.quantity
                        )
                        const numerator = ethers.BigNumber.from(
                          option.optionParameters.base.quantity
                        )
                        const strikePrice = new Quantity(
                          option.base.asset,
                          numerator.div(denominator)
                        )
                        breakEven = calculateBreakeven(
                          strikePrice.quantity,
                          premium,
                          false
                        )
                        puts.push({
                          entity: option,
                          asset: assetName,
                          breakEven: breakEven,
                          change: 0,
                          premium: premium,
                          strike: strikePrice.quantity,
                          volume: 0,
                          reserves: reserves,
                          reserve: reserve,
                          depth: 0,
                          address: option.address,
                          expiry: option.expiry,
                          id: option.name,
                        })
                      }
                    }
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
                .catch(() => {
                  console.log(calls)
                })
            })
            .catch((error) => console.log(error))
        })
        .catch((error) => console.log(error))
    },
    [dispatch, provider, chainId, setOptions]
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
