import { useCallback, useMemo } from 'react'
import router from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { updateOptions, OptionsAttributes } from './actions'
import { OptionsState } from './reducer'

import { Pair, Token } from '@uniswap/sdk'
import ethers, { BigNumberish, BigNumber } from 'ethers'
import { formatEther, parseEther } from 'ethers/lib/utils'

import { Protocol } from '@/lib/protocol'
import { Trade, Option, Quantity } from '@/lib/entities'

import { useActiveWeb3React } from '@/hooks/user/index'
import { useAddNotif } from '@/state/notifs/hooks'

export const useOptions = (): OptionsState => {
  const state = useSelector<AppState, AppState['options']>(
    (state) => state.options
  )
  return state
}

export const useUpdateOptions = (): ((assetName: string) => void) => {
  const { library, chainId, active } = useActiveWeb3React()
  const addNotif = useAddNotif()

  const dispatch = useDispatch<AppDispatch>()

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

  if (!active) {
    return useCallback(() => {
      router.push('/markets')
    }, [router])
  }
  return useCallback(
    async (assetName: string) => {
      const calls: OptionsAttributes[] = []
      const puts: OptionsAttributes[] = []
      const provider = library
      Protocol.getAllOptionClones(provider)
        .then(async (optionAddresses) => {
          Protocol.getOptionsUsingMultiCall(chainId, optionAddresses, provider)
            .then((optionEntitiesObject) => {
              let breakEven: BigNumberish
              const allKeys: string[] = Object.keys(optionEntitiesObject)
              const allPairAddresses: string[] = []
              const allTokensArray: string[][] = []
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
                allTokensArray.push([
                  option.assetAddresses[2],
                  option.assetAddresses[0],
                ])
              }
              Protocol.getPairsFromMultiCall(provider, allTokensArray)
                .then((allPairsData) => {
                  const actualPairs = []
                  for (const pair of allPairsData) {
                    if (pair !== ethers.constants.AddressZero) {
                      actualPairs.push(pair)
                    }
                  }
                  Protocol.getReservesFromMultiCall(provider, actualPairs)
                    .then((allReservesData) => {
                      const allPackedReserves: any = []
                      for (let t = 0; t < allReservesData.length / 3; t++) {
                        const startIndex = t * 3
                        const firstItem: string[] = allReservesData[startIndex]
                        const secondItem: string =
                          allReservesData[startIndex + 1]
                        const thirdItem: string =
                          allReservesData[startIndex + 2]
                        allPackedReserves.push([
                          firstItem,
                          secondItem,
                          thirdItem,
                        ])
                      }

                      let pairReserveTotal: BigNumber = BigNumber.from(0)
                      for (let i = 0; i < allKeys.length; i++) {
                        const key: string = allKeys[i]
                        const option: Option = optionEntitiesObject[key]
                        let index = 0
                        let reserves: string[] = ['0', '0']
                        let pairDataItem: string[]
                        for (const packed of allPackedReserves) {
                          index = packed.indexOf(option.assetAddresses[2])
                          if (index !== -1) {
                            reserves = packed[0]
                            pairDataItem = packed
                          }
                        }
                        const path: string[] = [
                          option.assetAddresses[2],
                          option.assetAddresses[0],
                        ]
                        if (typeof reserves === 'undefined')
                          reserves = ['0', '0']
                        const reserves0: BigNumberish = reserves[0]
                        const reserves1: BigNumberish = reserves[1]

                        let token0: string = option.assetAddresses[0]
                        let token1: string = option.assetAddresses[2]
                        if (typeof pairDataItem !== 'undefined') {
                          token0 = pairDataItem[1]
                          token1 = pairDataItem[2]
                        }

                        const Base: Quantity = option.optionParameters.base
                        const Quote: Quantity = option.optionParameters.quote

                        // depth calcs
                        const reserve0ForDepth: BigNumber = BigNumber.from(
                          reserves0.toString()
                        )
                        const reserve1ForDepth: BigNumber = BigNumber.from(
                          reserves1.toString()
                        )

                        const underlyingReserve =
                          token0 === option.assetAddresses[0]
                            ? reserve0ForDepth
                            : reserve1ForDepth

                        const twoPercentOfReserve = underlyingReserve
                          .mul(2)
                          .div(100)

                        let redeemCost: BigNumberish = '0'
                        if (
                          twoPercentOfReserve.gt(0) &&
                          reserve0ForDepth.gt(0) &&
                          reserve1ForDepth.gt(0)
                        ) {
                          redeemCost = Trade.getAmountsInPure(
                            twoPercentOfReserve,
                            path,
                            reserve0ForDepth,
                            reserve1ForDepth
                          )[0]
                        }

                        const redeemCostDivMinted = BigNumber.from(
                          redeemCost.toString()
                        ).div(Quote.quantity)

                        let premium: BigNumberish = Trade.getSpotPremium(
                          Base.quantity,
                          Quote.quantity,
                          path,
                          [reserves0, reserves1]
                        )
                        let reserve: BigNumberish = reserves1.toString()
                        let depth: BigNumberish = redeemCostDivMinted
                        if (typeof reserve === 'undefined') {
                          reserve = 0
                          depth = 0
                        }
                        if (typeof premium === 'undefined') premium = 0
                        pairReserveTotal = pairReserveTotal.add(
                          BigNumber.from(reserves1)
                        )

                        if (option.isCall) {
                          if (
                            Base.asset.symbol.toUpperCase() ===
                            assetName.toUpperCase()
                          ) {
                            breakEven = calculateBreakeven(
                              parseEther(
                                option.strikePrice.quantity.toString()
                              ),
                              premium,
                              true
                            )
                            console.log(reserves)
                            calls.push({
                              entity: option,
                              asset: assetName,
                              breakEven: breakEven,
                              change: 0,
                              premium: premium,
                              strike: option.strikePrice.quantity,
                              volume: 0,
                              reserves: reserves,
                              token0: token0,
                              token1: token1,
                              depth: depth.toString(),
                              address: option.address,
                              expiry: option.expiry,
                              id: option.name,
                            })
                          }
                        }
                        if (option.isPut) {
                          let asset
                          if (chainId !== 1) {
                            asset = Base.asset.symbol.toUpperCase()
                          } else {
                            asset = Quote.asset.symbol.toUpperCase()
                          }
                          if (asset === 'ETH') {
                            asset = 'WETH'
                          }
                          if (asset === assetName.toUpperCase()) {
                            const denominator = ethers.BigNumber.from(
                              option.optionParameters.quote.quantity
                            )
                            const numerator = ethers.BigNumber.from(
                              option.optionParameters.base.quantity
                            )

                            const strikePrice = new Quantity(
                              option.quote.asset,
                              numerator.div(denominator)
                            )
                            breakEven = calculateBreakeven(
                              parseEther(strikePrice.quantity.toString()),
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
                              token0: token0,
                              token1: token1,
                              depth: depth.toString(),
                              address: option.address,
                              expiry: option.expiry,
                              id: option.name,
                            })
                          }
                        }
                      }

                      dispatch(
                        updateOptions({
                          loading: false,
                          calls: calls,
                          puts: puts,
                          reservesTotal: pairReserveTotal,
                        })
                      )
                    })
                    .catch((error) => {
                      addNotif(0, 'Getting reserves', error.message, '')
                    })
                })
                .catch((error) =>
                  addNotif(0, 'Getting pairs', error.message, '')
                )
            })
            .catch((error) => {
              if (error) {
                addNotif(0, 'Getting options', error.message, '')
              }
            })
        })
        .catch((error) =>
          addNotif(0, 'Getting all option clones', error.message, '')
        )
    },
    [dispatch, library, chainId, updateOptions, addNotif]
  )
}
