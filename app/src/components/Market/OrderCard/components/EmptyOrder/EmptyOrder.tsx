import React from 'react'

import AddIcon from '@material-ui/icons/Add'
import styled from 'styled-components'

import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'

const EmptyOrder: React.FC = () => (
  <Card>
    <CardTitle>Your order</CardTitle>
    <CardContent>
      <StyledEmptyContent>
        <StyledEmptyIcon>
          <AddIcon />
        </StyledEmptyIcon>
        <StyledEmptyMessage>
          Click the open button next to the options to trade.
        </StyledEmptyMessage>
      </StyledEmptyContent>
    </CardContent>
  </Card>
)

const StyledEmptyContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const StyledEmptyIcon = styled.div`
  align-items: center;
  border: 1px dashed ${(props) => props.theme.color.grey[600]};
  border-radius: 32px;
  color: ${(props) => props.theme.color.grey[600]};
  display: flex;
  height: 44px;
  justify-content: center;
  width: 44px;
`

const StyledEmptyMessage = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
  margin-top: ${(props) => props.theme.spacing[3]}px;
  text-align: center;
`

export default EmptyOrder
