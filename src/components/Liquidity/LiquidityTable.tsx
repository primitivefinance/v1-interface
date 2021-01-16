import React, { useCallback } from 'react'
import styled from 'styled-components'
import Spacer from '@/components/Spacer'

// table
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import { TableColumns } from './LiquidityTable/LiquidityTableRow'

import LiquidityTableHeader from './LiquidityTable/LiquidityTableHeader'
import LiquidityTableRow from './LiquidityTable/LiquidityTableRow'

const LiquidityTable: React.FC = (props) => {
  const tableColumns: TableColumns = {
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
  }
  return (
    <OptionsContainer>
      <Table>
        <LiquidityTableHeader />
        <LiquidityTableContainer>
          <LiquidityTableContent>
            <LiquidityTableRow
              key={'test'}
              onClick={() => {}}
              href={`/liquidity`}
              columns={tableColumns}
            />
            <LiquidityTableRow
              key={'test'}
              onClick={() => {}}
              href={`/liquidity`}
              columns={tableColumns}
            />
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
