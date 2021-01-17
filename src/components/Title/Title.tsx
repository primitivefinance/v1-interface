import React from 'react'
import styled from 'styled-components'

interface TitleProps {
  align?: string
  margin?: number
  full?: boolean
  dark?: boolean
  weight?: number
}

const Title: React.FC<TitleProps> = ({
  children,
  align,
  margin,
  full,
  dark,
  weight,
}) => {
  return (
    <StyledTitle
      align={align}
      margin={margin}
      full={full}
      dark={dark}
      weight={weight}
    >
      {children}
    </StyledTitle>
  )
}

const StyledTitle = styled.div<TitleProps>`
  align-items: ${(props) => (props.align ? props.align : 'center')};
  color: ${(props) =>
    props.dark ? props.theme.color.black : props.theme.color.white};
  font-size: 16px;
  font-weight: ${(props) => (props.weight ? props.weight : 700)};
  margin: ${(props) => props.theme.spacing[props.margin ? props.margin : 2]}px;
  display: flex;
  flex: 1;
  width: ${(props) => (props.full ? '100%' : null)};
  letter-spacing: 0.5px;
  justify-content: space-between;
`

export default Title
