import React from 'react'
import styled from 'styled-components'
import Title from '@/components/Title'
import Tooltip from '@/components/Tooltip'
import ClearIcon from '@material-ui/icons/Clear'
import Button from '@/components/Button'

interface TitleType {
  tip: string
  text: string
}

interface CardHeaderProps {
  title: TitleType
  onClick?: () => void
}

const CardHeader: React.FC<CardHeaderProps> = ({ title, onClick }) => {
  return (
    <Title full>
      {title.text}
      {onClick ? (
        <CustomButton>
          <Button variant="transparent" size="sm" onClick={onClick}>
            <ClearIcon />
          </Button>
        </CustomButton>
      ) : null}
    </Title>
  )
}

const CustomButton = styled.div`
  margin-top: -0.1em;
  background: none;
`

export default CardHeader
