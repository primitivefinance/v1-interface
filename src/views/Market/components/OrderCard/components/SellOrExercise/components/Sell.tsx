import React, { useCallback, useState } from 'react'

import { useWeb3React } from '@web3-react/core'

import Box from 'components/Box'
import Button from 'components/Button'
import Input from 'components/Input'
import Label from 'components/Label'
import Spacer from 'components/Spacer'

import useOrders from 'hooks/useOrders'

import Available from '../../Available'

const Exercise: React.FC = () => {
  const { sellOptions, item } = useOrders()
  const [quantity, setQuantity] = useState('')
  const { library } = useWeb3React()

  const handleSellClick = useCallback(() => {
    sellOptions(library, item?.address, Number(quantity))
  }, [sellOptions, item, library, quantity])

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

  return (
    <>
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
      />
      <Spacer />
      <Button
        disabled={!quantity}
        full
        onClick={handleSellClick}
        text="Review order"
      />
      <Available>$250,000 Buying Power</Available>
    </>
  )
}

export default Exercise
