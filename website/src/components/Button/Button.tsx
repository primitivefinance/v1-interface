import React, { useContext, useMemo } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { ThemeContext } from 'react-neu'

export interface ButtonProps {
  children?: React.ReactNode
  disabled?: boolean
  full?: boolean
  href?: string
  onClick?: () => void
  round?: boolean
  size?: 'sm' | 'md' | 'lg'
  text?: string
  to?: string
  variant?: 'default' | 'secondary' | 'tertiary' | 'transparent'
}

const Button: React.FC<ButtonProps> = ({
  children,
  disabled,
  full,
  href,
  onClick,
  round,
  size,
  text,
  to,
  variant,
}) => {
  const {
    baseBg,
    buttonSizes,
    colors,
    spacing,
    surfaces,
    textColor,
  } = useContext(ThemeContext).theme

  let buttonPadding: number
  let fontSize: number
  let buttonSize: number
  switch (size) {
    case 'sm':
      buttonPadding = spacing[3]
      fontSize = 14
      buttonSize = buttonSizes.sm
      break
    case 'lg':
      buttonPadding = spacing[4]
      fontSize = 18
      buttonSize = buttonSizes.lg
      break
    case 'md':
    default:
      buttonPadding = spacing[4]
      fontSize = 16
      buttonSize = buttonSizes.md
  }

  let background: string
  let border = ''
  let buttonColor: string
  let hoverBackgroundColor = 'transparent'
  let hoverBorderColor = colors.white
  let hoverColor = colors.white
  switch (variant) {
    case 'secondary':
      background = 'transparent'
      border = `2px solid ${colors.grey[600]}`
      buttonColor = colors.black
      hoverColor = colors.white
      hoverBackgroundColor = colors.black
      break
    case 'tertiary':
      background = 'transparent'
      buttonColor = colors.grey[400]
      hoverBackgroundColor = colors.grey[600]
      break
    case 'transparent':
      background = 'transparent'
      border = `transparent`
      buttonColor = colors.grey[400]
      hoverBackgroundColor = 'transparent'
      break
    case 'default':
    default:
      background = colors.white
      buttonColor = colors.black
      border = ''
      hoverBackgroundColor = colors.white
      hoverColor = colors.black
  }

  const ButtonChild = useMemo(() => {
    if (to) {
      return <StyledLink to={to}>{text}</StyledLink>
    } else if (href) {
      return (
        <StyledExternalLink href={href} target="__blank">
          {text}
        </StyledExternalLink>
      )
    } else {
      return text
    }
  }, [href, text, to])

  return (
    <StyledButton
      background={background}
      border={border}
      color={buttonColor}
      disabled={disabled}
      fontSize={fontSize}
      full={full}
      hoverBackgroundColor={hoverBackgroundColor}
      hoverBorderColor={hoverBorderColor}
      hoverColor={hoverColor}
      onClick={onClick}
      padding={buttonPadding}
      round={round}
      size={buttonSize}
    >
      {ButtonChild}
      {children}
    </StyledButton>
  )
}

interface StyledButtonProps {
  background: string
  border: string
  color: string
  disabled?: boolean
  fontSize: number
  full?: boolean
  padding: number
  round?: boolean
  size: number
  hoverBackgroundColor: string
  hoverBorderColor: string
  hoverColor: string
}

const StyledButton = styled.button<StyledButtonProps>`
  align-items: center;
  background: ${props => props.background};
  border: ${props => (props.border ? props.border : '0')};
  border-radius: ${props =>
    props.round ? props.theme.buttonSizes.lg : props.theme.borderRadius}px;
  box-sizing: border-box;
  color: ${props => props.color};
  cursor: pointer;
  display: flex;
  font-family: Nunito Sans;
  font-size: ${props => props.fontSize}px;
  font-weight: 700;
  height: ${props => props.size}px;
  justify-content: center;
  letter-spacing: 0.5px;
  margin: 0;
  min-width: ${props => props.size}px;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  outline: none;
  padding-left: ${props => (props.round ? 0 : props.padding)}px;
  padding-right: ${props => (props.round ? 0 : props.padding)}px;
  pointer-events: ${props => (!props.disabled ? undefined : 'none')};
  white-space: nowrap;
  width: ${props => (props.full ? '100%' : undefined)};
  &:hover {
    background: ${props => props.hoverBackgroundColor};
    border-color: ${props => props.hoverBorderColor};
    color: ${props => props.hoverColor};
  }
`

const StyledExternalLink = styled.a`
  align-items: center;
  color: inherit;
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: center;
  margin: 0 ${props => -props.theme.spacing[4]}px;
  padding: 0 ${props => props.theme.spacing[4]}px;
  text-decoration: none;
`

const StyledLink = styled(Link)`
  align-items: center;
  color: inherit;
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: center;
  margin: 0 ${props => -props.theme.spacing[4]}px;
  padding: 0 ${props => props.theme.spacing[4]}px;
  text-decoration: none;
`

export default Button
