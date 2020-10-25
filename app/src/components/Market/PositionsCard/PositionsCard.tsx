import React, { useEffect } from 'react'
import styled from 'styled-components'

import useOrders from '@/hooks/useOrders'
import useOptions from '@/hooks/useOptions'
import AddIcon from '@material-ui/icons/Add'

import { useWeb3React } from '@web3-react/core'

import { OrderItem } from '@/contexts/Order/types'
import { destructureOptionSymbol } from '@/lib/utils'

import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Button from '@/components/Button'
import EmptyTable from '../EmptyTable'
import FilledBar from '../FilledBar'
import LitContainer from '@/components/LitContainer'
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import TableCell from '@/components/TableCell'
import TableRow from '@/components/TableRow'
import Timer from '../Timer'

export type FormattedOption = {
  breakEven: number
  change: number
  price: number
  strike: number
  volume: number
}

const PositionsCard: React.FC = () => {
  const { options, getOptions } = useOptions()
  const { item, onRemoveItem } = useOrders()
  const { library } = useWeb3React()

  /*
  useEffect(() => {
    if (library) {
      if (options.calls.length > 1) {
        getPositions(asset.toLowerCase(), options)
      }
    }
  }, [library, asset, getPositions, options])
*/

  const headers = [
    'Asset',
    'Strike',
    'Expires',
    'Qty',
    'Price',
    'Remaining',
    'Manage',
  ]

  if (item.id) return null
  return (
    <Card>
      <CardTitle>Your Positions</CardTitle>
      <CardContent>
        <StyledEmptyContent>
          <StyledEmptyIcon>
            <AddIcon />
          </StyledEmptyIcon>
          <StyledEmptyMessage>
            Click an option to open an position
          </StyledEmptyMessage>
        </StyledEmptyContent>
      </CardContent>
    </Card>
  )
}

const StyledEmptyContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const StyledEmptyIcon = styled.div`
  align-items: center;
  border: 1px dashed ${(props) => props.theme.color.white};
  border-radius: 32px;
  color: ${(props) => props.theme.color.white};
  display: flex;
  height: 44px;
  justify-content: center;
  width: 44px;
`

const StyledEmptyMessage = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
  margin-top: ${(props) => props.theme.spacing[3]}px;
  text-align: center;
`

export default PositionsCard
