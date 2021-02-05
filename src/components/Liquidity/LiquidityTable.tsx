import React, { useCallback } from 'react'
import styled from 'styled-components'

// table
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import { TableColumns } from './LiquidityTable/LiquidityTableRow'

import LiquidityTableHeader from './LiquidityTable/LiquidityTableHeader'
import LiquidityTableRow from './LiquidityTable/LiquidityTableRow'
import LoadingTable from '@/components/Market/OptionsTable/LoadingTable'

import { usePositions } from '@/state/positions/hooks'
import { useUpdateItem } from '@/state/order/hooks'
import { useOptions } from '@/state/options/hooks'
import { formatEther } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { Operation } from '@primitivefi/sdk'

export interface OptionsTableProps {
  callActive: boolean
}

const LiquidityTable: React.FC<OptionsTableProps> = (props) => {
  const { callActive } = props
  const positions = usePositions()
  const updateItem = useUpdateItem()
  const options = useOptions()
  const type = callActive ? 'calls' : 'puts'

  const formatTableColumns = useCallback(
    (option: any): TableColumns => {
      const tableKey: string = option.entity.address
      /* const tableAssset: string = asset.toUpperCase() */
      const tableStrike: string = option.entity.strikePrice.toString()

      const tableReserve0: string = formatEther(
        option.market.reserveOf(option.entity.underlying).raw.toString()
      ).toString()
      const tableReserve1: string = formatEther(
        option.market.reserveOf(option.entity.redeem).raw.toString()
      ).toString()

      // tableReserve1 should always be short option token
      const tableReserves: string[] = [tableReserve0, tableReserve1]
      const tableExpiry: number = option.entity.expiryValue

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
        <LiquidityTableContent>
          {options.loading ? (
            <LoadingTable ext />
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
                    onClick={() => updateItem(option, Operation.NONE)}
                    columns={tableColumns}
                  />
                )
              })}
            </ScrollBody>
          )}
        </LiquidityTableContent>
      </Table>
    </OptionsContainer>
  )
}

export const LiquidityTableContent = styled.div`
  display: block;
  min-width: 1200px;
`

const ScrollBody = styled(TableBody)``

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 5em;
  margin-top: 0em;
  width: 90%;
`

export default LiquidityTable
