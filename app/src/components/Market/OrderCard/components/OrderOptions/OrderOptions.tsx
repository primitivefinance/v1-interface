import React, { useState } from 'react'

import CloseIcon from '@material-ui/icons/Close'
import styled from 'styled-components'

import IconButton from '@/components/IconButton'
import Button from '@/components/Button'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import useOrders from '@/hooks/useOrders'
import { destructureOptionSymbol } from '@/lib/utils'
import useTokenBalance from '@/hooks/useTokenBalance'
import Exercise from '../Exercise/Exercise'
import { useWeb3React } from '@web3-react/core'

import Label from '@/components/Label'
import LineItem from '@/components/LineItem'

import formatBalance from '@/utils/formatBalance'

const OrderOptions: React.FC = () => {
  const { item, onChangeItem } = useOrders()
  const { chainId } = useWeb3React()
  const { asset, month, day, type, strike } = destructureOptionSymbol(item.id)
  const optionBalance = useTokenBalance(item.address)
  const LPBalance = useTokenBalance(item.address) // fix

  const change = (t: string) => {
    onChangeItem(item, t)
  }

  return (
    <>
      <Box column alignItems="flex-start">
        <LineItem label={'Option Balance'} data={optionBalance} />
        <Spacer />
        <Box row justifyContent="flex-start">
          <Button full size="md" onClick={() => change('BUY')}>
            Buy
          </Button>
          <Spacer />
          {!optionBalance ? (
            <>
              <Button size="md" onClick={() => change('SELL')}>
                Sell
              </Button>
              <Spacer />
              <Button size="md" onClick={() => change('EXEC')}>
                Exercise
              </Button>
              <Spacer />
            </>
          ) : (
            <></>
          )}
          <Button full size="md" onClick={() => change('M_SELL')}>
            Mint & Sell
          </Button>
        </Box>
      </Box>
      <Spacer />
      <Box column alignItems="flex-start">
        <LineItem label={'LP Balance'} data={LPBalance} />
        <Spacer />
        <Button size="md" onClick={() => change('LP')}>
          Provide Liquidity
        </Button>
        <Spacer />
        {!LPBalance ? (
          <>
            <Button full size="md" onClick={() => change('W_LP')}>
              Withdraw LP
            </Button>
            <Spacer />
          </>
        ) : (
          <></>
        )}
      </Box>
    </>
  )
}

const StyledR = styled.div`
  margin-bottom: -1.2em;
`
const StyledBalance = styled.h6`
  color: ${(props) => props.theme.color.white};
`
const StyledSub = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
  letter-spacing: 1px;
  opacity: 0.66;
  text-transform: uppercase;
`
export default OrderOptions
