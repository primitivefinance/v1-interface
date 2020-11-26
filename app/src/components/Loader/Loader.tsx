import React from 'react'
import styled from 'styled-components'

interface LoaderProps {
  text?: string
  dark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const Loader: React.FC<LoaderProps> = ({ text, dark = false, size = 'md' }) => {
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
      <Spinner size={s} dark={dark} />
      {!!text && <StyledText>{text}</StyledText>}
    </StyledContainer>
  )
}

interface StyledSpinnerProps {
  size: number
  dark: boolean
}

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Spinner = ({ size, dark }) => (
  <StyledSpinner viewBox="0 0 50 50" size={size} dark={dark}>
    <circle
      className="path"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      strokeWidth="4"
    />
  </StyledSpinner>
)

const StyledSpinner = styled.svg<StyledSpinnerProps>`
  animation: rotate 2s linear infinite;
  height: ${(props) => props.size}px;
  width: ${(props) => props.size}px;
  & .path {
    stroke: #ffffff;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
`

const StyledText = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
`

export default Loader
