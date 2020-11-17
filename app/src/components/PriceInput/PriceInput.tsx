import React from 'react'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Label from '@/components/Label'
import Spacer from '@/components/Spacer'
import { BigNumberish } from 'ethers'

export interface PriceInputProps {
  name?: string
  title: string
  quantity: BigNumberish | number
  onChange: (e: React.FormEvent<HTMLInputElement>) => void
  onClick: () => void
  startAdornment?: React.ReactNode
  balance?: BigNumberish | number
}

const PriceInput: React.FC<PriceInputProps> = ({
  name,
  title,
  quantity,
  onChange,
  onClick,
  startAdornment,
  balance,
}) => {
  return (
    <>
      <Label text={title} />
      <Spacer size="sm" />
      <Input
        name={name}
        placeholder={'0.00'}
        startAdornment={!startAdornment ? startAdornment : null}
        onChange={onChange}
        value={`${quantity ? quantity.toString() : ''}`}
        endAdornment={<Button size="sm" text="Max" onClick={onClick} />}
      />
      {balance ? (
        <span style={{ alignSelf: 'flex-end' }}>Balance: {balance}</span>
      ) : (
        <> </>
      )}
    </>
  )
}
export default PriceInput
