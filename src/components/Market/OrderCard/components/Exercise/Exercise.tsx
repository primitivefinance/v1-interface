import React from 'react'

import Box from '@/components/Box'
import Label from '@/components/Label'
import Spacer from '@/components/Spacer'

export interface ExerciseProps {
  cost: string
  received: string
}

const Exercise: React.FC<ExerciseProps> = ({ cost, received }) => {
  return (
    <>
      <Box row justifyContent="space-between">
        <Label text="Total Cost" />
        <span>{cost}</span>
      </Box>
      <Spacer />
      <Box row justifyContent="space-between">
        <Label text="Recieve" />
        <span>{received}</span>
      </Box>
      <Spacer />{' '}
    </>
  )
}

export default Exercise
