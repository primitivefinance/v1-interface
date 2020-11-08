import React from 'react'

import Box from '@/components/Box'
import Input from '@/components/Input'
import Label from '@/components/Label'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
import { BigNumberish } from 'ethers'

export interface LPProps {
  titles: string[]
  balance: BigNumberish
  quantities: BigNumberish[]
  onPrimaryChange: (e: React.FormEvent<HTMLInputElement>) => void
  onPrimaryClick: () => void
  onSecondaryChange: (e: React.FormEvent<HTMLInputElement>) => void
  onSecondaryClick: () => void
}

const LP: React.FC<LPProps> = ({
  titles,
  balance,
  quantities,
  onPrimaryChange,
  onPrimaryClick,
  onSecondaryChange,
  onSecondaryClick,
}) => {
  return (
    <>
      <Spacer />
      <PriceInput
        name="primary"
        title={titles[0]}
        quantity={quantities[0]}
        onChange={onPrimaryChange}
        onClick={onPrimaryClick}
      />
      <Spacer />
      <PriceInput
        name="secondary"
        title={titles[1]}
        quantity={quantities[1]}
        onChange={onSecondaryChange}
        onClick={onSecondaryClick}
      />
      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Price per LP Token" />
        <span>${balance}</span>
      </Box>
    </>
  )
}
export default LP
