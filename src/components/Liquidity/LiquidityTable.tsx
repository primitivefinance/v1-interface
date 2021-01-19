import React, { useCallback } from 'react'
import styled from 'styled-components'
import Spacer from '@/components/Spacer'

// table
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import { TableColumns } from './LiquidityTable/LiquidityTableRow'

import LiquidityTableHeader from './LiquidityTable/LiquidityTableHeader'
import LiquidityTableRow from './LiquidityTable/LiquidityTableRow'
import LoadingTable from '@/components/Market/OptionsTable/LoadingTable'

import { usePositions } from '@/state/positions/hooks'
import { useItem, useUpdateItem } from '@/state/order/hooks'
import { useOptions, useUpdateOptions } from '@/state/options/hooks'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { Operation } from '@primitivefi/sdk'
import { Fraction, TokenAmount } from '@uniswap/sdk'

export interface OptionsTableProps {
  callActive: boolean
}

const LiquidityTable: React.FC<OptionsTableProps> = (props) => {
  const { callActive } = props
  const positions = usePositions()
  const updateItem = useUpdateItem()
  const options = useOptions()
  const type = callActive ? 'calls' : 'puts'
  /* const tableColumns: TableColumns = {
    key: 'key',
    asset: 'tableAssset',
    strike: '0.00',
    share: '0.00',
    asset1: '0.00',
    asset2: '0.00',
    fees: '0.00',
    liquidity: ['0.00', '0.00'],
    expiry: 0,
    isCall: true,
  } */

  const formatTableColumns = useCallback(
    (option: any): TableColumns => {
      const tableKey: string = option.entity.address
      /* const tableAssset: string = asset.toUpperCase() */
      const tableStrike: string = option.entity.strikePrice.toString()
      const tableBid: string = formatEther(
        option.market.spotClosePremium.raw.toString()
      ).toString()
      const tableAsk: string = formatEther(
        option.market.spotOpenPremium.raw.toString()
      ).toString()

      const tableReserve0: string = formatEther(
        option.market.reserveOf(option.entity.underlying).raw.toString()
      ).toString()
      const tableReserve1: string = formatEther(
        option.market.reserveOf(option.entity.redeem).raw.toString()
      ).toString()

      // tableReserve1 should always be short option token
      const tableReserves: string[] = [tableReserve0, tableReserve1]
      const tableExpiry: number = option.entity.expiryValue

      /* const supply = BigNumber.from(parseEther(lpTotalSupply).toString())
      const tSupply = new TokenAmount(
        option.market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      )

      supply.gt(0) && lpBalance.gt(0)
        ? lpBalance.divide(tSupply.add(lpBalance))
        : new Fraction('0')

      poolShare = poolShare.multiply('100').toSignificant(6) */

      const tableColumns: TableColumns = {
        key: tableKey,
        asset: option.entity.underlying.symbol,
        entity: option.entity,
        market: option.market,
        strike: tableStrike,
        ask: option.market.spotClosePremium.raw.toString(),
        share: '0.00',
        asset1: tableReserve0,
        asset2: tableReserve1,
        fees: '0.00',
        liquidity: tableReserves,
        expiry: tableExpiry,
        isCall: option.entity.isCall,
      }
      return tableColumns
    },
    [positions]
  )
  return (
    <OptionsContainer>
      <Table>
        <LiquidityTableHeader />
        <LiquidityTableContainer>
          <LiquidityTableContent>
            {options.loading ? (
              <LoadingTable />
            ) : (
              <ScrollBody>
                {options[type].map((option) => {
                  const tableColumns: TableColumns = formatTableColumns(option)
                  const hasPosition =
                    positions.options
                      .map((pos) => {
                        return pos.attributes.entity
                          ? pos.attributes.entity.address ===
                              option.entity.address &&
                              BigNumber.from(pos.lp.toString()).gt(0)
                          : false
                      })
                      .indexOf(true) !== -1

                  if (
                    +new Date() / 1000 >= option.entity.expiryValue &&
                    !hasPosition
                  )
                    return null
                  return (
                    <LiquidityTableRow
                      key={option.entity.address}
                      onClick={() =>
                        updateItem(option, Operation.ADD_LIQUIDITY)
                      }
                      href={`/liquidity`}
                      columns={tableColumns}
                    />
                  )
                })}
              </ScrollBody>
            )}
          </LiquidityTableContent>
        </LiquidityTableContainer>
      </Table>
      <Spacer />
    </OptionsContainer>
  )
}

export const LiquidityTableContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`

export const LiquidityTableContent = styled.div`
  width: ${(props) => props.theme.flexboxgrid.container.md}rem;
`

const ScrollBody = styled(TableBody)`
  height: 10em;
  overflow-x: hidden;
`

const OptionsContainer = styled.div`
  margin-left: 2em;
  margin-top: -0.2em;
`

export default LiquidityTable
