import React from 'react'
import styled from 'styled-components'
import TableCell from '@/components/TableCell'
import Tooltip from '@/components/Tooltip'
import Button from '@/components/Button'
import Spacer from '@/components/Spacer'
import Box from '@/components/Box'
import numeral from 'numeral'
import LaunchIcon from '@material-ui/icons/Launch'
import { ETHERSCAN_RINKEBY, ETHERSCAN_MAINNET } from '@primitivefi/sdk'
import { ChainId } from '@sushiswap/sdk'
import Title from '@/components/Title'

export interface Greeks {
  iv: number
  delta: number
  theta: number
  gamma: number
  vega: number
  rho: number
}

export interface GreeksTableRowProps {
  onClick: () => void
  greeks: Greeks
  links: string[]
  chainId: ChainId
}

const GreeksTableRow: React.FC<GreeksTableRowProps> = ({
  onClick,
  greeks,
  links,
  chainId,
}) => {
  const greekHeaders = [
    {
      name: 'IV',
      tip:
        'Implied volatility (IV) is an estimate of the future volatility of the underlying stock based on options prices',
    },
    {
      name: 'Delta',
      tip:
        'Delta is a ratio—sometimes referred to as a hedge ratio—that compares the change in the price of an underlying asset with the change in the price of an option',
    },
    {
      name: 'Theta',
      tip:
        'Theta is a measure of the rate of decline in the value of an option due to the passage of time.',
    },
    {
      name: 'Gamma',
      tip:
        "Gamma is the rate of change in an option's delta per 1-point move in the underlying asset's price",
    },
    {
      name: 'Vega',
      tip:
        "Vega represents the amount that an option contract's price changes in reaction to a 1% change in the implied volatility of the underlying asset",
    },
    {
      name: 'Rho',
      tip:
        'Rho is the rate at which the price of a derivative changes relative to a change in the risk-free rate of interest',
    },
  ]
  const { iv, delta, theta, gamma, vega, rho } = greeks
  const base =
    chainId === ChainId.RINKEBY ? ETHERSCAN_RINKEBY : ETHERSCAN_MAINNET
  return (
    <>
      <StyledTableRow isHead>
        {greekHeaders.map((header) => {
          if (header.tip) {
            return (
              <TableCell key={header.name}>
                <Tooltip text={header.tip}>{header.name}</Tooltip>
              </TableCell>
            )
          }
          return <TableCell key={header.name}>{header.name}</TableCell>
        })}
      </StyledTableRow>
      <StyledTableRow onClick={onClick}>
        <TableCell>
          {numeral(
            typeof iv === 'number' && iv < 1000 && iv > 0 ? iv * 100 : 0
          ).format('0.00%')}
        </TableCell>
        <TableCell>{numeral(delta).format('0.00')}</TableCell>
        <TableCell>{numeral(theta / 365).format('0.00')}</TableCell>
        <TableCell>{numeral(gamma).format('0.00')}</TableCell>
        <TableCell>{numeral(vega / 100).format('0.00')}</TableCell>
        <TableCell>{numeral(rho / 100).format('0.00')}</TableCell>
      </StyledTableRow>
      <StyledTableTop>
        {/* <Spacer />
        <StyledLink href="/manage">
          Manage Option {''}{' '}
          <LaunchIcon style={{ marginLeft: '.3em', fontSize: '14px' }} />
        </StyledLink> */}
        <Box column justifyContent="flex-end">
          <StyledLink
            onClick={() => {
              window.open(`https://app.sushi.com/pair/${links[0]}`, '')
              return false
            }}
            href="javascript:void(0);"
          >
            View Option Market on SushiSwap {''}{' '}
            <LaunchIcon style={{ marginLeft: '.3em', fontSize: '14px' }} />
          </StyledLink>
        </Box>
        <StyledBox row alignItems="center" justifyContent="space-around">
          <StyledLinkSub
            onClick={() => {
              window.open(`${base}/${links[1]}`, '')
              return false
            }}
            href="javascript:void(0);"
          >
            Option Token
            <LaunchIcon style={{ marginLeft: '.3em', fontSize: '14px' }} />
          </StyledLinkSub>

          <StyledLinkSub
            onClick={() => {
              window.open(`${base}/${links[2]}`, '')
              return false
            }}
            href="javascript:void(0);"
          >
            Short Option Token
            <LaunchIcon style={{ marginLeft: '.3em', fontSize: '14px' }} />
          </StyledLinkSub>

          <StyledLinkSub
            onClick={() => {
              window.open(`${base}/${links[0]}`, '')
              return false
            }}
            href="javascript:void(0);"
          >
            LP Token
            <LaunchIcon style={{ marginLeft: '.3em', fontSize: '14px' }} />
          </StyledLinkSub>
        </StyledBox>
      </StyledTableTop>
    </>
  )
}

interface StyleProps {
  isHead?: boolean
  isActive?: boolean
}

const StyledLink = styled.a`
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  flex-direction: row;
  align-items: center;
  text-transform: uppercase;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
  cursor: pointer;
  &:hover {
    color: ${(props) => props.theme.color.white};
  }
`

const StyledBox = styled(Box)`
  width: 30em;
`
const StyledLinkSub = styled.a`
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  flex-direction: row;
  align-items: center;
  text-transform: initial;
  text-decoration: none;
  font-size: 12px;
  letter-spacing: 0px;
  cursor: pointer;
  &:hover {
    color: ${(props) => props.theme.color.white};
  }
`
const StyledTableTop = styled.div`
  align-items: center;
  background-color: ${(props) => props.theme.color.grey[800]};
  border-bottom: 1px solid ${(props) => props.theme.color.grey[700]};
  color: ${(props) => props.theme.color.white};
  display: flex;
  justify-content: space-between;
  height: ${(props) => props.theme.rowHeight}px;
  margin-left: -${(props) => props.theme.spacing[4]}px;
  padding-left: ${(props) => props.theme.spacing[4]}px;
  padding-right: ${(props) => props.theme.spacing[4]}px;
`

const StyledTableRow = styled.div<StyleProps>`
  align-items: center;
  background-color: ${(props) => props.theme.color.grey[800]};
  border-bottom: 2px solid
    ${(props) =>
      props.isHead || props.isActive
        ? 'transparent'
        : props.theme.color.grey[700]};
  color: ${(props) =>
    props.isHead ? props.theme.color.grey[400] : props.theme.color.white};
  display: flex;
  height: ${(props) => props.theme.rowHeight}px;
  margin-left: -${(props) => props.theme.spacing[4]}px;
  padding-left: ${(props) => props.theme.spacing[4]}px;
  padding-right: ${(props) => props.theme.spacing[4]}px;
`

export default GreeksTableRow
