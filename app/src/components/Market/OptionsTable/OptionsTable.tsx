import React, { useEffect, useState, useCallback } from 'react'
import LitContainer from '@/components/LitContainer'
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
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
import { Greeks } from './GreeksTableRow'
import NewMarketRow from './NewMarketRow'
import OptionsTableRow, { TableColumns } from './OptionsTableRow'
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
  const { callActive, asset, optionExp } = props
  const { options, getOptions } = useOptions()
  const { onAddItem } = useOrders()
  const { library, chainId } = useWeb3React()
  const type = callActive ? 'calls' : 'puts'
  const baseUrl = chainId === 4 ? ETHERSCAN_RINKEBY : ETHERSCAN_MAINNET

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
      const premium = BigNumber.from(premiumWei.toString())
        .mul(spotPriceWei)
        .div(parseEther('1'))
      return formatEther(premium)
    },
    [key, data]
  )

  const calculateAllGreeks = useCallback(
    (option: any) => {
      const blackScholes = new BlackScholes(
        18,
        option.id,
        COINGECKO_ID_FOR_MARKET[asset],
        option.entity
      )
      const price = data
        ? data[key]
          ? data[key].usd
            ? +data[key].usd
            : 0
          : 0
        : 0
      blackScholes.setRiskFree(0)
      blackScholes.setDeviation(0.1)
      blackScholes.setPrice(price)
      const delta = blackScholes.delta()
      const theta = blackScholes.theta()
      const gamma = blackScholes.gamma()
      const vega = blackScholes.vega()
      const rho = blackScholes.rho()
      const ivEstimate = 1
      const actualCost = Number(calculatePremiumInDollars(option.premium))
      const iv = blackScholes.getImpliedVolatility(actualCost, ivEstimate)
      const greeks: Greeks = {
        delta: delta,
        theta: theta,
        gamma: gamma,
        vega: vega,
        rho: rho,
        iv: iv,
      }
      return greeks
    },
    [key, data]
  )

  const formatTableColumns = useCallback(
    (option: any): TableColumns => {
      const tableKey: string = option.entity.address
      const tableAssset: string = asset.toUpperCase()
      const tableStrike: string = formatBalance(
        option.entity.strikePrice.quantity
      ).toString()
      const tableBreakeven: string = formatEtherBalance(
        calculateBreakeven(option.premium, option.entity.isCall)
      ).toString()
      const tablePremium: string = formatBalance(
        calculatePremiumInDollars(option.premium)
      ).toString()
      const tablePremiumUnderlying: string = formatEtherBalance(
        option.premium
      ).toString()
      const tableDepth: string = option.depth.toString()

      const reserve0Units =
        option.token0 === option.entity.assetAddresses[0]
          ? asset.toUpperCase()
          : 'SHORT'

      const tableReserve0: string =
        reserve0Units === asset.toUpperCase()
          ? formatEtherBalance(option.reserves[0].toString()).toString()
          : formatEtherBalance(option.reserves[1].toString()).toString()
      const tableReserve1: string =
        reserve0Units === asset.toUpperCase()
          ? formatEtherBalance(option.reserves[1].toString()).toString()
          : formatEtherBalance(option.reserves[0].toString()).toString()
      const tableReserves: string[] = [tableReserve0, tableReserve1]
      const tableAddress: string = formatAddress(option.address)

      const tableColumns: TableColumns = {
        key: tableKey,
        asset: tableAssset,
        strike: tableStrike,
        breakeven: tableBreakeven,
        premium: tablePremium,
        premiumUnderlying: tablePremiumUnderlying,
        depth: tableDepth,
        reserves: tableReserves,
        address: tableAddress,
      }
      return tableColumns
    },
    [key, data, asset]
  )

  return (
    <Table>
      <OptionsTableHeader />
      <LitContainer>
        {options.loading ? (
          <LoadingTable />
        ) : (
          <TableBody>
            {options[type].map((option) => {
              if (optionExp != option.expiry && option.expiry === 0) return null
              const allGreeks: Greeks = calculateAllGreeks(option)
              const tableColumns: TableColumns = formatTableColumns(option)
              return (
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
                  columns={tableColumns}
                  greeks={allGreeks}
                />
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
