import React, { useState, useCallback } from 'react'
import styled from 'styled-components'

import TableCell from '@/components/TableCell'
import TableRow from '@/components/TableRow'
import IconButton from '@/components/IconButton'

import { useClickAway } from '@/hooks/utils/useClickAway'

import AddIcon from '@material-ui/icons/Add'
import LaunchIcon from '@material-ui/icons/Launch'
import CheckIcon from '@material-ui/icons/Check'

import { useItem } from '@/state/order/hooks'

import GreeksTableRow, { Greeks } from '../GreeksTableRow'

import numeral from 'numeral'
import isZero from '@/utils/isZero'
import { parseEther } from 'ethers/lib/utils'

export interface TableColumns {
  key: string
  asset: string
  strike: string
  breakeven: string
  premium: string
  premiumUnderlying: string
  depth: string[]
  reserves: string[]
  address: string
  isCall: boolean
}

export interface OptionsTableRowProps {
  onClick: () => void
  columns: TableColumns
  href: string
  greeks: Greeks
}

const OptionsTableRow: React.FC<OptionsTableRowProps> = ({
  onClick,
  columns,
  href,
  greeks,
}) => {
  const [toggle, setToggle] = useState(false)
  const { item } = useItem()
  const {
    key,
    asset,
    strike,
    breakeven,
    premium,
    premiumUnderlying,
    depth,
    reserves,
    address,
    isCall,
  } = columns
  const handleOnClick = useCallback(() => {
    if (reserves[0] !== '0.00') {
      setToggle(!toggle)
    }
  }, [toggle, setToggle])
  const handleOnAdd = (e) => {
    e.stopPropagation()
    onClick()
  }
  const nodeRef = useClickAway(() => {
    setToggle(false)
  })

  const units = isCall ? asset.toUpperCase() : 'DAI'

  return (
    <StyledDiv ref={nodeRef}>
      <TableRow
        isActive={
          item.entity === null
            ? false
            : item?.entity.address === key
            ? true
            : false
        }
        key={key}
        onClick={handleOnClick}
      >
        <TableCell>
          <span>
            {numeral(strike).format('0.00a')} <Units>DAI</Units>
          </span>
        </TableCell>
        <TableCell>
          {!isZero(parseEther(premium)) ? (
            <span>
              {numeral(breakeven).format('0.00a')} <Units>DAI</Units>
            </span>
          ) : (
            <>{`-`}</>
          )}
        </TableCell>
        {!isZero(parseEther(premium)) ? (
          <TableCell>
            {isCall ? (
              <StyledR>
                <StyledT>
                  <span>
                    {numeral(premium).format('(0.000a)')} <Units>DAI</Units>
                  </span>
                </StyledT>
                <span>
                  {numeral(premiumUnderlying).format('(0.000a)')}{' '}
                  <Units>{units}</Units>
                </span>
              </StyledR>
            ) : (
              <span>
                {numeral(premium).format('(0.000a)')} <Units>DAI</Units>
              </span>
            )}
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}
        {+depth[1] > 0 ? (
          <TableCell>
            <StyledR>
              <StyledT>
                {numeral(depth[0]).format('0.00a')} <Units>{`LONG`}</Units>
              </StyledT>
              <span>
                {depth[1]} <Units>{'%'}</Units>
              </span>
            </StyledR>
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}
        {parseInt(reserves[1]) > 0 ? (
          <TableCell>
            <StyledR>
              <StyledT>
                {numeral(reserves[1]).format('0.00a')} <Units>{'SHORT'}</Units>
              </StyledT>
              <span>
                {numeral(reserves[0]).format('0.00a')} <Units>{units}</Units>
              </span>
            </StyledR>
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}
        <TableCell key={address}>
          <StyledARef href={href} target="__blank">
            {address} <LaunchIcon style={{ fontSize: '14px' }} />
          </StyledARef>
        </TableCell>
        <StyledButtonCell key={'Open'}>
          <IconButton
            onClick={onClick}
            variant={
              item.entity === null
                ? 'outlined'
                : item.entity.address === key
                ? 'selected-outlined'
                : 'outlined'
            }
            size="sm"
          >
            {item.entity === null ? (
              <AddIcon style={{ fontSize: '2em' }} />
            ) : item?.entity.address === key ? (
              <CheckIcon />
            ) : (
              <AddIcon />
            )}
          </IconButton>
        </StyledButtonCell>
      </TableRow>
      {toggle ? (
        <GreeksTableRow onClick={() => setToggle(!toggle)} greeks={greeks} />
      ) : (
        <></>
      )}
    </StyledDiv>
  )
}

const StyledT = styled.span`
  border-width: 0 0 1px 0;
  border-style: solid;
  border-color: ${(props) => props.theme.color.grey[600]};
  padding-bottom: 3px;
`
const StyledR = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 90%;
`
const StyledARef = styled.a`
  color: ${(props) => props.theme.color.grey[400]};
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.color.white};
  }
`

const StyledDiv = styled.div`
  color: black;
`

const StyledButtonCell = styled.div`
  font-weight: inherit;
  justify-content: flex-start;
`

const Units = styled.span`
  opacity: 0.66;
  font-size: 12px;
`

export default OptionsTableRow
