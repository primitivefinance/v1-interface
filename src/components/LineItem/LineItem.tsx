import React from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Loader from '@/components/Loader'
import Tooltip from '@/components/Tooltip'

import formatBalance from '@/utils/formatBalance'

export interface LineItemProps {
  label: React.ReactNode
  data?: string | number | any
  loading?: boolean
  units?: any
  tip?: any
  color?: string
}

const LineItem: React.FC<LineItemProps> = ({
  label,
  data,
  loading,
  units,
  tip,
  color,
}) => {
  const sign = units
    ? units !== ''
      ? units.toString().charAt(0) === '-'
        ? '-'
        : units.toString().charAt(0) === '+'
        ? '+'
        : null
      : null
    : null
  const currency = units
    ? typeof units === 'string'
      ? sign === '+' || sign === '-'
        ? units.toString().slice(2)
        : units.toString()
      : null
    : null
  return (
    <StyledLineItem row justifyContent="space-between" alignItems="center">
      {tip ? (
        <Tooltip text={tip}>
          <StyledLabel>{label}</StyledLabel>
        </Tooltip>
      ) : (
        <StyledLabel>{label}</StyledLabel>
      )}
      {loading ? (
        <span>
          <Loader size="sm" />
        </span>
      ) : (
        <span>
          <>
            {sign}
            <Color color={color}>
              {currency === '$' ? currency : null} {formatBalance(data)}{' '}
            </Color>
            <StyledSym>
              {currency !== '$'
                ? currency === 'DAI STABLECOIN'
                  ? 'DAI'
                  : currency
                : null}
            </StyledSym>
          </>
        </span>
      )}
    </StyledLineItem>
  )
}

interface ColorProps {
  color?: string
}

const Color = styled.span<ColorProps>`
  color: ${(props) =>
    props.color == 'red' ? props.theme.color.red[500] : 'inherit'};
`

const StyledSym = styled.a`
  opacity: 0.66;
`
const StyledLabel = styled.span<ColorProps>`
  align-items: center;
  color: ${(props) =>
    props.color == 'red'
      ? props.theme.color.red[500]
      : props.theme.color.grey[400]};
  display: flex;
  flex: 1;
  letter-spacing: 1px;
  opacity: 1;
  font-size: 14px;
  text-transform: uppercase;
  font-weight: 550;
`

const StyledLineItem = styled(Box)`
  width: 100%;
`

export default LineItem
