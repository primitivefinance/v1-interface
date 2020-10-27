import React from 'react'

import Button from '@/components/Button'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import useOrders from '@/hooks/useOrders'
import useTokenBalance from '@/hooks/useTokenBalance'

import LineItem from '@/components/LineItem'

const OrderOptions: React.FC = () => {
  const { item, onChangeItem } = useOrders()
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

export default OrderOptions
