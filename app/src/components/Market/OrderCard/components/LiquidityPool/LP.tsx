import React from 'react'

import Box from '@/components/Box'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Label from '@/components/Label'
import Spacer from '@/components/Spacer'
import PriceInput from '@/components/PriceInput'

export interface LPProps {
  title: string
  balance: string
  quantity: string
  onChange: (e: React.FormEvent<HTMLInputElement>) => void
  onClick: () => void
}

const LP: React.FC<LPProps> = ({
  title,
  balance,
  quantity,
  onChange,
  onClick,
}) => {
  return (
    <>
      <Spacer />
      <PriceInput
        title={title}
        quantity={quantity}
        onChange={onChange}
        onClick={onClick}
      />
      <Spacer />
      <Label text="Quantity (DAI)" />
      <Spacer size="sm" />
      <Input placeholder="0.00" onChange={onChange} value={`${quantity}`} />
      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Price per LP Token" />
        <span>${balance}</span>
      </Box>
    </>
  )
}
export default LP
