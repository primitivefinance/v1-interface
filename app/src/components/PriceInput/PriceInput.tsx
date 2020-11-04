import React from 'react'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Label from '@/components/Label'
import Spacer from '@/components/Spacer'
import { BigNumberish } from 'ethers'

export interface PriceInputProps {
  title: string
  quantity: BigNumberish | number
  onChange: (e: React.FormEvent<HTMLInputElement>) => void
  onClick: () => void
  startAdornment?: React.ReactNode
}

const PriceInput: React.FC<PriceInputProps> = ({
  title,
  quantity,
  onChange,
  onClick,
  startAdornment,
}) => {
  return (
    <>
      <Label text={title} />
      <Spacer size="sm" />
      <Input
        placeholder={'0.00'}
        startAdornment={!startAdornment ? startAdornment : null}
        onChange={onChange}
        value={`${quantity ? quantity.toString() : ''}`}
        endAdornment={<Button size="sm" text="Max" onClick={onClick} />}
      />
    </>
  )
}
export default PriceInput
