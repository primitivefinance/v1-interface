import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import Link from 'next/link'

export interface ButtonProps {
  children?: React.ReactNode
  disabled?: boolean
  full?: boolean
  isLoading?: boolean
  href?: string
  onClick?: () => void
  round?: boolean
  size?: 'sm' | 'md' | 'lg'
  text?: string
  to?: boolean // use if Button is wrapped in Next.js Link component
  variant?: 'default' | 'secondary' | 'tertiary' | 'transparent'
}

const Button: React.FC<ButtonProps> = ({
  children,
  disabled,
  full,
  isLoading,
  href,
  onClick,
  round,
  size,
  text,
  to,
  variant,
}) => {
  const { color, buttonSize, spacing } = useContext(ThemeContext)

  let buttonPadding: number
  let fontSize: number
  switch (size) {
    case 'sm':
      buttonPadding = spacing[3]
      fontSize = 14
      break
    case 'lg':
      buttonPadding = spacing[4]
      fontSize = 18
      break
    case 'md':
    default:
      buttonPadding = spacing[4]
      fontSize = 16
  }

  let background: string
  let border = ''
  let buttonColor: string
  let hoverBackgroundColor = 'transparent'
  const hoverBorderColor = color.white
  let hoverColor = color.white
  switch (variant) {
    case 'secondary':
      background = 'transparent'
      border = `1px solid ${color.grey[600]}`
      buttonColor = color.white
      break
    case 'tertiary':
      background = 'transparent'
      buttonColor = color.grey[400]
      hoverBackgroundColor = color.grey[600]
      break
    case 'transparent':
      background = 'transparent'
      border = `transparent`
      buttonColor = color.grey[400]
      hoverBackgroundColor = 'transparent'
      break
    case 'default':
    default:
      background = color.white
      buttonColor = color.grey[600]
      border = ''
      hoverBackgroundColor = color.white
      hoverColor = color.black
  }

  const ButtonChild = useMemo(() => {
    if (href) {
      return (
        <StyledExternalLink href={href} target="__blank">
          {text}
        </StyledExternalLink>
      )
    }
    if (isLoading) {
      return <p>LOADING</p>
    } else {
      return text
    }
  }, [href, text, to, isLoading])

  if (to) {
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
        {text}
      </StyledButton>
    )
  }
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
  background: ${(props) => props.background};
  border: ${(props) => (props.border ? props.border : '0')};
  border-radius: ${(props) =>
    props.round ? props.theme.buttonSize : props.theme.borderRadius}px;
  box-sizing: border-box;
  color: ${(props) => props.color};
  cursor: pointer;
  display: flex;
  font-family: Nunito Sans;
  font-size: ${(props) => props.fontSize}px;
  font-weight: 700;
  height: ${(props) => props.size}px;
  justify-content: center;
  letter-spacing: 0.5px;
  margin: 0;
  min-width: ${(props) => props.size}px;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  outline: none;
  padding-left: ${(props) => (props.round ? 0 : props.padding)}px;
  padding-right: ${(props) => (props.round ? 0 : props.padding)}px;
  pointer-events: ${(props) => (!props.disabled ? undefined : 'none')};
  white-space: nowrap;
  width: ${(props) => (props.full ? '100%' : undefined)};
  &:hover {
    background: ${(props) => props.hoverBackgroundColor};
    border-color: ${(props) => props.hoverBorderColor};
    color: ${(props) => props.hoverColor};
  }
`

const StyledExternalLink = styled.a`
  align-items: center;
  color: inherit;
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: center;
  margin: 0 ${(props) => -props.theme.spacing[4]}px;
  padding: 0 ${(props) => props.theme.spacing[4]}px;
  text-decoration: none;
`

const StyledLink = styled(Link)`
  align-items: center;
  color: inherit;
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: center;
  margin: 0 ${(props) => -props.theme.spacing[4]}px;
  padding: 0 ${(props) => props.theme.spacing[4]}px;
  text-decoration: none;
`
const StyledText = styled.p`
  text-decoration: none;
`
export default Button
