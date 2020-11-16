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

export interface TableColumns {
  key: string
  asset: string
  strike: string
  breakeven: string
  premium: string
  premiumUnderlying: string
  depth: string
  reserves: string[]
  address: string
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
  } = columns
  const handleOnClick = useCallback(() => {
    setToggle(!toggle)
  }, [toggle, setToggle])
  const handleOnAdd = (e) => {
    e.stopPropagation()
    onClick()
  }
  const nodeRef = useClickAway(() => {
    setToggle(false)
  })
  return (
    <div ref={nodeRef}>
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
        <TableCell>${strike}</TableCell>
        <TableCell>$ {breakeven}</TableCell>
        {+premium > 0 ? (
          <TableCell>
            $ {premium} / {premiumUnderlying} {asset}
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}
        {+depth > 0 ? (
          <TableCell>
            {depth} {'Options'}
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}
        {+reserves[0] > 0 ? (
          <TableCell>
            {reserves[0]} {asset.toUpperCase()} / {reserves[1]} {'SHORT'}
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
    </div>
  )
}

const StyledARef = styled.a`
  color: ${(props) => props.theme.color.white};
  text-decoration: none;
`

const StyledButtonCell = styled.div`
  font-weight: inherit;
  flex: 0.25;
  justify-content: center;
  margin-right: ${(props) => props.theme.spacing[2]}px;
`

export default OptionsTableRow
