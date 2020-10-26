import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import Box from '@/components/Box'
import IconButton from '@/components/IconButton'
import AddIcon from '@material-ui/icons/Add'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Label from '@/components/Label'
import Spacer from '@/components/Spacer'

import useOrders from '@/hooks/useOrders'
import useTokenBalance from '@/hooks/useTokenBalance'
import { destructureOptionSymbol } from '@/lib/utils'

import formatBalance from '@/utils/formatBalance'

const LP: React.FC = () => {
  const { buyOptions, item, onChangeItem } = useOrders()
  const { asset, month, day, type, strike } = destructureOptionSymbol(item.id)

  const [quantity, setQuantity] = useState('')
  const { library } = useWeb3React()

  const stablecoinAddress = '0xb05cB19b19e09c4c7b72EA929C8CfA3187900Ad2' // Fix - should not be hardcode
  const tokenBalance = useTokenBalance(stablecoinAddress)

  /* const handleBuyClick = useCallback(() => {
    buyOptions(library, item?.address, Number(quantity))
  }, [buyOptions, item, library, quantity]) */

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
        <StyledTitle>{`Provide Liquidity`}</StyledTitle>
      </Box>
      <Spacer />
      <Label text={`Quantity (${item.id})`} />
      <Spacer size="sm" />
      <Input
        placeholder="0.00"
        onChange={handleQuantityChange}
        value={`${quantity}`}
        endAdornment={<Button size="sm" text="Max" onClick={handleSetMax} />}
      />
      <Spacer />
      <Label text="Quantity (DAI)" />
      <Spacer size="sm" />
      <Input
        placeholder="0.00"
        onChange={handleQuantityChange}
        value={`${quantity}`}
      />
      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Price per LP Token" />
        <span>${formatBalance(tokenBalance)}</span>
      </Box>
      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="LP Tokens Recieved" />
        <span>{+(item.price * +quantity).toFixed(2)}</span>
      </Box>
      <Spacer />
      <Button
        disabled={!quantity}
        full
        onClick={() => buyOptions(library, item?.address, Number(quantity))}
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

export default LP
