import React, { useEffect } from 'react'
import styled from 'styled-components'

import useOrders from '@/hooks/useOrders'
import { destructureOptionSymbol } from '@/lib/utils'
import Box from '@/components/Box'
import Button from '@/components/Button'
import Spacer from '@/components/Spacer'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import Toggle from '@/components/Toggle'
import ToggleButton from '@/components/ToggleButton'

const Short: React.FC = () => {
  const { item, onChangeItem } = useOrders()
  const { asset, month, day, type, strike } = destructureOptionSymbol(item.id)

  return (
    <Card border>
      <CardContent>
        <Box row justifyContent="space-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onChangeItem(item, '')}
            text="Back"
          />
          <Spacer />
          <StyledTitle>{`Open Short ${asset} ${
            type === 'C' ? 'Call' : 'Put'
          } $${strike} ${month}/${day}`}</StyledTitle>
        </Box>
        <Mint />
      </CardContent>
    </Card>
  )
}

const StyledTitle = styled.h4`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  display: flex;
  font-size: 18px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px;
`

export default Short
