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

const OrderOptions: React.FC = () => {
  const { item, onChangeItem } = useOrders()
  const { chainId } = useWeb3React()
  const { asset, month, day, type, strike } = destructureOptionSymbol(item.id)
  const optionBalance = useTokenBalance(item.address)
  const LPBalance = useTokenBalance(item.address)

  const change = (t: string) => {
    onChangeItem(item, t)
  }

  return (
    <>
      <StyledR />
      <>
        <Box column alignItems="flex-start">
          <Box row justifyContent="flex-start" alignItems="center">
            <StyledSub>Option Token Balance</StyledSub>
            <Spacer />
            <StyledBalance>{optionBalance}</StyledBalance>
          </Box>
          <Box row justifyContent="flex-start">
            <Button variant="secondary" size="sm" onClick={() => change('BUY')}>
              Buy
            </Button>
            <Spacer />
            {!optionBalance ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => change('SELL')}
                >
                  Sell
                </Button>
                <Spacer />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => change('EXEC')}
                >
                  Exercise
                </Button>
                <Spacer />
              </>
            ) : (
              <></>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => change('M_SELL')}
            >
              Mint & Sell
            </Button>
          </Box>
          {chainId === 1 ? null : (
            <>
              <Spacer />

              <Button
                variant="secondary"
                size="sm"
                onClick={() => change('TEST')}
              >
                Mint Test Tokens
              </Button>
            </>
          )}
        </Box>
        <Spacer />
        <Box column alignItems="flex-start">
          <Box row justifyContent="flex-start" alignItems="center">
            <StyledSub>LP Token Balance</StyledSub>
            <Spacer />
            <StyledBalance>{LPBalance}</StyledBalance>
          </Box>
          <Button variant="secondary" size="sm" onClick={() => change('LP')}>
            Provide Liquidity
          </Button>
          <Spacer />
          {!LPBalance ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => change('W_LP')}
              >
                Withdraw LP
              </Button>
              <Spacer />
            </>
          ) : (
            <></>
          )}
        </Box>
      </>
    </>
  )
}

const StyledR = styled.div`
  margin-bottom: -1.2em;
`
const StyledBalance = styled.h6`
  color: white;
`
const StyledSub = styled.h5`
  color: grey;
`
export default OrderOptions
