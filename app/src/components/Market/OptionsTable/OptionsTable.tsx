import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'

import Spacer from '@/components/Spacer'
import LitContainer from '@/components/LitContainer'
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import Loader from '@/components/Loader'
import useOrders from '@/hooks/useOrders'
import useOptions from '@/hooks/useOptions'
import formatAddress from '@/utils/formatAddress'
import formatBalance from '@/utils/formatBalance'
import formatEtherBalance from '@/utils/formatEtherBalance'
import { useWeb3React } from '@web3-react/core'
import { ETHERSCAN_MAINNET, ETHERSCAN_RINKEBY } from '@/constants/index'
import { Operation } from '@/constants/index'

import { BigNumber } from 'ethers'
import { COINGECKO_ID_FOR_MARKET } from '@/constants/index'
import useSWR from 'swr'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { EmptyAttributes } from '@/contexts/Options/types'

import { BlackScholes } from '@/lib/math'
import GreeksTableRow from './GreeksTableRow'
import NewMarketRow from './NewMarketRow'
import OptionsTableRow from './OptionsTableRow'
import OptionsTableHeader from './OptionsTableHeader'
import LoadingTable from './LoadingTable'

export type FormattedOption = {
  breakEven: number
  change: number
  premium: number
  strike: number
  volume: number
}

export interface OptionsTableProps {
  optionExp: number
  asset: string
  assetAddress: string
  callActive: boolean
}

const OptionsTable: React.FC<OptionsTableProps> = (props) => {
  const { callActive, asset, assetAddress, optionExp } = props
  const { options, getOptions } = useOptions()
  const { onAddItem, item } = useOrders()
  const { library, chainId } = useWeb3React()

  const [greeks, setGreeks] = useState(false)

  const getMarketDetails = useCallback(() => {
    const key: string = COINGECKO_ID_FOR_MARKET[asset]
    return { key }
  }, [asset])

  const { key } = getMarketDetails()

  const { data } = useSWR(
    `https://api.coingecko.com/api/v3/simple/price?ids=${key}&vs_currencies=usd&include_24hr_change=true`
  )

  useEffect(() => {
    if (library) {
      if (asset === 'eth') {
        getOptions('WETH')
      } else {
        getOptions(asset.toUpperCase())
      }
    }
  }, [library, asset, getOptions])

  const calculateBreakeven = useCallback(
    (premiumWei, isCall) => {
      const price = data
        ? data[key]
          ? data[key].usd
            ? data[key].usd
            : '0'
          : '0'
        : '0'
      const spotPrice = price.toString()
      const spotPriceWei = parseEther(spotPrice)
      let breakeven = BigNumber.from(premiumWei.toString())
        .mul(spotPriceWei)
        .div(parseEther('1'))
      breakeven = isCall
        ? breakeven.add(spotPriceWei)
        : spotPriceWei.sub(breakeven)
      return breakeven.toString()
    },
    [key, data]
  )

  const calculatePremiumInDollars = useCallback(
    (premiumWei) => {
      const price = data
        ? data[key]
          ? data[key].usd
            ? data[key].usd
            : '0'
          : '0'
        : '0'
      const spotPrice = price.toString()
      const spotPriceWei = parseEther(spotPrice)
      let premium = BigNumber.from(premiumWei.toString())
        .mul(spotPriceWei)
        .div(parseEther('1'))
      console.log(`premium in dollars: ${formatEther(premium)}`)
      return formatEther(premium)
    },
    [key, data]
  )

  const type = callActive ? 'calls' : 'puts'
  const baseUrl = chainId === 4 ? ETHERSCAN_RINKEBY : ETHERSCAN_MAINNET

  return (
    <Table>
      <OptionsTableHeader />
      <LitContainer>
        {options.loading ? (
          <LoadingTable />
        ) : (
          <TableBody>
            {options[type].map((option) => {
              const {
                entity,
                breakEven,
                premium,
                strike,
                reserves,
                token0,
                token1,
                depth,
                address,
                expiry,
              } = option
              if (optionExp != expiry && expiry === 0) return null
              const reserve0Units =
                token0 === entity.assetAddresses[0]
                  ? asset.toUpperCase()
                  : 'SHORT'

              const bs = new BlackScholes(
                18,
                option.id,
                COINGECKO_ID_FOR_MARKET[asset],
                entity
              )
              bs.setRiskFree(0)
              bs.setDeviation(0.1)
              bs.setPrice(
                data
                  ? data[key]
                    ? data[key].usd
                      ? +data[key].usd
                      : 0
                    : 0
                  : 0
              )

              const getGreeks = (blackScholes: BlackScholes) => {
                const delta = blackScholes.delta()
                const theta = blackScholes.theta()
                const gamma = blackScholes.gamma()
                const vega = blackScholes.vega()
                const rho = blackScholes.rho()
                return { delta, theta, gamma, vega, rho }
              }

              const getIv = (blackScholes: BlackScholes) => {
                const iv = blackScholes.getImpliedVolatility(
                  Number(calculatePremiumInDollars(option.premium)),
                  1
                )
                return iv
              }

              const iv = getIv(bs)

              const { delta, theta, gamma, vega, rho } = getGreeks(bs)

              return (
                <>
                  <OptionsTableRow
                    onClick={() => {
                      setGreeks(!greeks)
                      onAddItem(
                        {
                          ...option,
                        },
                        Operation.NONE
                      )
                    }}
                    href={`${baseUrl}/${option.address}`}
                    columns={{
                      key: address,
                      asset: asset.toUpperCase(),
                      strike: formatBalance(strike).toString(),
                      breakeven: formatEtherBalance(
                        calculateBreakeven(premium, entity.isCall)
                      ).toString(),
                      premium: formatBalance(
                        calculatePremiumInDollars(option.premium)
                      ).toString(),
                      premiumUnderlying: formatEtherBalance(premium).toString(),
                      depth: depth.toString(),
                      reserves: [
                        reserve0Units === asset.toUpperCase()
                          ? formatEtherBalance(
                              reserves[0].toString()
                            ).toString()
                          : formatEtherBalance(
                              reserves[1].toString()
                            ).toString(),
                        reserve0Units === asset.toUpperCase()
                          ? formatEtherBalance(
                              reserves[1].toString()
                            ).toString()
                          : formatEtherBalance(
                              reserves[0].toString()
                            ).toString(),
                      ],
                      address: formatAddress(address),
                    }}
                  />

                  {greeks ? (
                    <>
                      <GreeksTableRow
                        onClick={() => setGreeks(!greeks)}
                        greeks={{
                          iv: iv,
                          delta: delta,
                          theta: theta,
                          gamma: gamma,
                          vega: vega,
                          rho: rho,
                        }}
                      />
                    </>
                  ) : (
                    <></>
                  )}
                </>
              )
            })}
            <NewMarketRow
              onClick={() => {
                onAddItem(EmptyAttributes, Operation.NEW_MARKET) //TBD
              }}
            />
          </TableBody>
        )}
      </LitContainer>
    </Table>
  )
}

export default OptionsTable
