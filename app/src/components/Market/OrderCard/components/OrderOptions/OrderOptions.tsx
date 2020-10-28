import React from 'react'
import styled from 'styled-components'

import Label from '@/components/Label'
import Button from '@/components/Button'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import useOrders from '@/hooks/useOrders'
import useTokenBalance from '@/hooks/useTokenBalance'

import LineItem from '@/components/LineItem'
import TableRow from '../../../../TableRow/TableRow'
import formatBalance from '@/utils/formatBalance'

const OrderOptions: React.FC = () => {
  const { item, onChangeItem } = useOrders()
  const optionBalance = useTokenBalance(item.address)
  const LPBalance = useTokenBalance(item.address) // fix

  const change = (t: string) => {
    onChangeItem(item, t)
  }

  return (
    <>
      <Box row alignItems="flex-start" justifyContent="flex-start">
        <StyledColumn>
          <Box row justifyContent="flex-start" alignItems="center">
            <Label text={'Long Tokens'} />
            <StyledBalance>{formatBalance(optionBalance)}</StyledBalance>
          </Box>
          <Button full size="sm" onClick={() => change('BUY')}>
            Open Long
          </Button>
          <Spacer size="sm" />
          <Button
            full
            size="sm"
            variant="secondary"
            onClick={() => change('BUY')}
          >
            Close Long
          </Button>
          <Spacer />
          <Box row justifyContent="flex-start" alignItems="center">
            <Label text={'Long LP Tokens'} />
            <StyledBalance>{formatBalance(LPBalance)}</StyledBalance>
          </Box>
          <Spacer size="sm" />
          <Button size="sm" onClick={() => change('LP')}>
            Provide Liquidity
          </Button>
          <Spacer size="sm" />
          {!LPBalance ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => change('W_LP')}
            >
              Withdraw Liquidity
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              Withdraw Liquidity
            </Button>
          )}
        </StyledColumn>
        <StyledColumn>
          <Box row justifyContent="flex-start" alignItems="center">
            <Label text={'Short Tokens'} />
            <StyledBalance>{formatBalance(optionBalance)}</StyledBalance>
          </Box>
          <Button full size="sm" onClick={() => change('BUY')}>
            Open Short
          </Button>
          <Spacer size="sm" />
          <Button
            full
            size="sm"
            variant="secondary"
            onClick={() => change('BUY')}
          >
            Close Short
          </Button>
          <Spacer />
          <Box row justifyContent="flex-start" alignItems="center">
            <Label text={'Short LP Tokens'} />
            <StyledBalance>{formatBalance(LPBalance)}</StyledBalance>
          </Box>
          <Spacer size="sm" />
          <Button size="sm" onClick={() => change('LP')}>
            Provide Liquidity
          </Button>
          <Spacer size="sm" />
          {!LPBalance ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => change('W_LP')}
            >
              Withdraw Liquidity
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              Withdraw Liquidity
            </Button>
          )}
        </StyledColumn>
        <Spacer />
      </Box>
    </>
  )
}

const StyledColumn = styled.div`
  display: flex;
  padding-left: 1em;
  padding-right: 1em;
  flex-direction: column;
  width: 42%;
`

const StyledBalance = styled.h5`
  color: ${(props) => props.theme.color.white};
  padding-left: 1em;
`

export default OrderOptions
