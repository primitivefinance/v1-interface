import React, { useContext } from 'react'
import styled, { keyframes, ThemeContext } from 'styled-components'

import CardIcon from '../CardIcon'

interface LoaderProps {
  text?: string
  dark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const Loader: React.FC<LoaderProps> = ({ text, dark = false, size = 'md' }) => {
  const { spacing } = useContext(ThemeContext)
  let s: number
  switch (size) {
    case 'lg':
      s = 60
      break
    case 'sm':
      s = 20
      break
    case 'md':
    default:
      s = 40
  }

  return (
    <StyledContainer>
      <StyledSpinner size={s} dark={dark} />
      {!!text && <StyledText>{text}</StyledText>}
    </StyledContainer>
  )
}
interface StyledSpinnerProps {
  size: number
  dark: boolean
}
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const StyledSpinner = styled.div<StyledSpinnerProps>`
  font-size: 32px;
  height: ${(props) => props.size}px;
  width: ${(props) => props.size}px;
  background: ${(props) =>
    !props.dark ? props.theme.color.white : props.theme.color.grey[600]}};
  border-radius: 50%;
  position: relative;
  animation: 1s ${spin} infinite linear;
`

const StyledText = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
`

export default Loader
