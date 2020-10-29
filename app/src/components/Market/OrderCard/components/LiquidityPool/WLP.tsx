import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import Box from '@/components/Box'
import IconButton from '@/components/IconButton'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Label from '@/components/Label'
import Spacer from '@/components/Spacer'

import useOrders from '@/hooks/useOrders'
import { useTokenBalance } from '@/hooks/data'

import formatBalance from '@/utils/formatBalance'
import { Operation } from '@/lib/constants'

const WLP: React.FC = () => {
  const { onChangeItem, item, submitOrder } = useOrders()
  const [quantity, setQuantity] = useState('')
  const { library } = useWeb3React()

  const stablecoinAddress = '0xb05cB19b19e09c4c7b72EA929C8CfA3187900Ad2' // Fix - should not be hardcode
  const tokenBalance = useTokenBalance(stablecoinAddress)

  const handleBuyClick = useCallback(() => {
    submitOrder(library, item?.address, Number(quantity), Operation.LONG)
  }, [submitOrder, item, library, quantity])

  const handleQuantityChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (!e.currentTarget.value) {
        setQuantity('')
      }
      if (Number(e.currentTarget.value)) {
        setQuantity(e.currentTarget.value)
      }
    },
    [setQuantity]
  )

  const buyingPower = 250000

  const handleSetMax = () => {
    const max =
      Math.round((buyingPower / +item.price + Number.EPSILON) * 100) / 100
    setQuantity(max.toString())
  }

  return (
    <>
      <Box row justifyContent="flex-start">
        <IconButton
          variant="tertiary"
          size="sm"
          onClick={() => onChangeItem(item, '')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Spacer />
        <StyledTitle>{`Withdraw Liquidity for Option`}</StyledTitle>
      </Box>

      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Price" />
        <span>${item.price.toFixed(2)}</span>
      </Box>

      <Spacer />
      <Label text="Quantity" />
      <Spacer size="sm" />
      <Input
        placeholder="0.00"
        onChange={handleQuantityChange}
        value={`${quantity}`}
        endAdornment={<Button size="sm" text="Max" onClick={handleSetMax} />}
      />

      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Buying Power" />
        <span>${formatBalance(tokenBalance)}</span>
      </Box>

      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Total Debit" />
        <span>
          {+quantity ? '-' : ''}${(+item.price * +quantity).toFixed(2)}
        </span>
      </Box>

      <Spacer />
      <Button
        disabled={!quantity}
        full
        onClick={handleBuyClick}
        text="Confirm Transaction"
      />
    </>
  )
}

const StyledTitle = styled.h5`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  display: flex;
  font-size: 18px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px;
`

export default WLP
