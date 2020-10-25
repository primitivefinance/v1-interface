import React, { useCallback, useState } from 'react'

import { useWeb3React } from '@web3-react/core'

import Box from '@/components/Box'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Label from '@/components/Label'
import Spacer from '@/components/Spacer'

import useOrders from '@/hooks/useOrders'
import useTokenBalance from '@/hooks/useTokenBalance'

import formatBalance from '@/utils/formatBalance'
import { Operation } from '@/lib/constants'

const Mint: React.FC = () => {
  const { submitOrder, item } = useOrders()
  const [quantity, setQuantity] = useState('')
  const { library } = useWeb3React()

  const testEthAddress = '0xc45c339313533a6c9B05184CD8B5486BC53F75Fb' // Fix - should not be hardcode
  const tokenBalance = useTokenBalance(testEthAddress)

  const handleMintClick = useCallback(() => {
    submitOrder(library, item?.address, Number(quantity), Operation.MINT)
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

  const handleSetMax = () => {
    const max =
      Math.round((+tokenBalance / +item.price + Number.EPSILON) * 100) / 100
    setQuantity(max.toString())
  }

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
        endAdornment={<Button size="sm" text="Max" onClick={handleSetMax} />}
      />
      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Minting Power" />
        <span>{formatBalance(tokenBalance)} ETH</span>
      </Box>
      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Total Credit" />
        <span>
          {+quantity ? '+' : ''}${(+item.price * +quantity).toFixed(2)}
        </span>
      </Box>
      <Spacer />
      <Button
        disabled={!quantity}
        full
        onClick={handleMintClick}
        text="Continue to Review"
      />
    </>
  )
}

export default Mint
