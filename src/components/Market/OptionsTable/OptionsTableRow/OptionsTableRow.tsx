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
import formatExpiry from '@/utils/formatExpiry'

export interface TableColumns {
  key: string
  asset: string
  strike: string
  breakeven: string
  bid: string
  ask: string
  reserves: string[]
  expiry: number
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
  const currentTimestamp = new Date()
  const {
    key,
    asset,
    strike,
    breakeven,
    bid,
    ask,
    reserves,
    expiry,
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
            {numeral(strike).format(+strike >= 10 ? '0' : '0.00')}{' '}
            <Units>DAI</Units>
          </span>
        </TableCell>
        <TableCell>
          {!isZero(parseEther(bid)) ? (
            <span>
              {numeral(breakeven).format('0.00a')} <Units>DAI</Units>
            </span>
          ) : (
            <>{`-`}</>
          )}
        </TableCell>
        {!isZero(parseEther(bid)) ? (
          <TableCell>
            {isCall ? (
              <span>
                {numeral(bid).format('(0.000a)')} <Units>{units}</Units>
              </span>
            ) : (
              <span>
                {numeral(bid).format('(0.000a)')} <Units>DAI</Units>
              </span>
            )}
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}
        {parseFloat(reserves[0]) > 0 ? (
          <TableCell>
            <span>
              {numeral(reserves[0]).format('0.00a')} <Units>{units}</Units>
            </span>
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}
        {expiry ? (
          <TableCell>
            <span>{formatExpiry(expiry).utc.substr(4, 12)}</span>
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}
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
  display: flex;
  flex-direction: column;
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
