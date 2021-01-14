import React, { useEffect, useMemo, useState, useContext } from 'react'
import styled from 'styled-components'

import AddIcon from '@material-ui/icons/Add'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'

import LaunchIcon from '@material-ui/icons/Launch'

import { Protocol } from '@/lib/protocol'

import { useWeb3React } from '@web3-react/core'

import Table from '@/components/Table'
import TableRow from '@/components/TableRow'
import TableCell from '@/components/TableCell'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Spacer from '@/components/Spacer'
import IconButton from '@/components/IconButton'
import Box from '@/components/Box'
import Button from '@/components/Button'
import Loader from '@/components/Loader'
import Tooltip from '@/components/Tooltip'

import {
  ETHERSCAN_MAINNET,
  ETHERSCAN_RINKEBY,
  Operation,
  getIconForMarket,
  COINGECKO_ID_FOR_MARKET,
  POSITIONS_LOADING,
} from '@/constants/index'

import { usePositions } from '@/state/positions/hooks'
import { useUpdateItem, useItem } from '@/state/order/hooks'
import formatEtherBalance from '@/utils/formatEtherBalance'
import formatBalance from '@/utils/formatBalance'

import { formatEther } from 'ethers/lib/utils'
import formatExpiry from '@/utils/formatExpiry'
import LineItem from '@/components/LineItem'
import { useClickAway } from '@/hooks/utils/useClickAway'
import numeral from 'numeral'
export interface TokenProps {
  option: any // replace with option type
}

const Position: React.FC<TokenProps> = ({ option }) => {
  const { chainId, library } = useWeb3React()
  const updateItem = useUpdateItem()
  const { date, month, year, utc } = formatExpiry(
    option.attributes.entity.expiryValue
  )

  const handleClick = () => {
    updateItem(option.attributes, Operation.NONE)
  }

  const baseUrl = chainId === 4 ? ETHERSCAN_RINKEBY : ETHERSCAN_MAINNET

  return (
    <StyledPosition onClick={handleClick} height={48}>
      <TableCell>
        <StyledValue>{`${formatEtherBalance(option.long, 2)}`}</StyledValue>
      </TableCell>

      <TableCell>
        <StyledValue>
          {` ${option.attributes.entity.isCall ? 'Call' : 'Put'} `}
        </StyledValue>
      </TableCell>

      <TableCell>
        <StyledValue>
          {`${
            option.attributes.entity.strikePrice <= 1
              ? numeral(option.attributes.entity.strikePrice).format('$0.00')
              : numeral(option.attributes.entity.strikePrice).format('$0')
          }`}{' '}
        </StyledValue>
      </TableCell>

      <TableCell>
        <StyledValue>{`${utc.substr(4, 8)}`}</StyledValue>
      </TableCell>

      <TableCell>
        <StyledValue>
          {numeral(formatEther(option.long)).format('$0.00')}
        </StyledValue>
      </TableCell>
      {/* <StyledPrices row justifyContent="space-between" alignItems="center">
        <StyledPrice>
          <StyledT>Long</StyledT>
          {formatEtherBalance(option.long)}
        </StyledPrice>
        <StyledPrice>
          <StyledT>Short</StyledT>
          {formatEtherBalance(option.redeem)}
        </StyledPrice>
        <StyledPrice>
          <StyledT>LP</StyledT>
          {formatEtherBalance(option.lp)}
        </StyledPrice>
      </StyledPrices> */}
    </StyledPosition>
  )
}

const headers = [
  {
    name: 'Qty',
    tip:
      'The price the underlying asset must reach to reach a net cost of zero',
  },
  {
    name: 'Type',
    tip: 'The purchase price for the underlying asset of this option',
  },
  {
    name: 'Strike',
    tip: 'The purchase price for the underlying asset of this option',
  },
  {
    name: 'Expiry',
    tip: 'The purchase price for the underlying asset of this option',
  },

  {
    name: 'Value',
    tip:
      'The current spot price of an option token willing to be purchased at.',
  },
]

const PositionsCard: React.FC = () => {
  const item = useItem()
  const positions = usePositions()
  const [open, setOpen] = useState(true)

  if (item.item.asset) {
    return null
  }
  if (positions.loading) {
    return (
      <Card border>
        <CardContent>
          <StyledEmptyContent>
            <Spacer size="sm" />
            <StyledEmptyMessage>Loading...</StyledEmptyMessage>
            <StyledEmptyMessage>
              <Loader size="lg" />
            </StyledEmptyMessage>
            <Spacer size="sm" />
          </StyledEmptyContent>
        </CardContent>
      </Card>
    )
  }
  if (!positions.exists) {
    return (
      <Card border>
        <CardContent>
          <StyledEmptyContent>
            <Spacer size="sm" />
            <StyledEmptyIcon>
              <AddIcon />
            </StyledEmptyIcon>
            <StyledEmptyMessage>
              Add an option to open a position
            </StyledEmptyMessage>
            <Spacer size="sm" />
          </StyledEmptyContent>
        </CardContent>
      </Card>
    )
  }
  return (
    <div>
      <Card border>
        <Reverse />
        <CardTitle>
          <div onClick={() => setOpen(!open)}>
            <StyledBox row justifyContent="space-between" alignItems="center">
              <Title>{`Active ${item.item.asset.toUpperCase()} Positions`}</Title>
              <Spacer />
              {!open ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </StyledBox>
          </div>
        </CardTitle>
        <Reverse />
        {!open ? (
          <Spacer size="sm" />
        ) : (
          <Scroll>
            <CardContent>
              <Table>
                <StyledTableHead>
                  <TableRow isHead height={48}>
                    {headers.map((header) => {
                      return (
                        <TableCell key={header.name}>{header.name}</TableCell>
                      )
                    })}
                  </TableRow>
                </StyledTableHead>
                {positions.options.map((pos, i) => {
                  return (
                    <StyledTableBorder>
                      <Position key={i} option={pos} />
                    </StyledTableBorder>
                  )
                })}
              </Table>
            </CardContent>
          </Scroll>
        )}
      </Card>
    </div>
  )
}

const StyledTableHead = styled.div`
  border-bottom: 1px solid ${(props) => props.theme.color.grey[500]};
`
const StyledTableBorder = styled.div`
  border-bottom: 1px solid ${(props) => props.theme.color.grey[700]};
`

const LoadingMess = styled.h3`
  color: ${(props) => props.theme.color.grey[400]};
`

const Scroll = styled.div`
  overflow: scroll;
  max-height: 20em;
  border-radius: ${(props) => props.theme.borderRadius}px;
`

const StyledBox = styled(Box)`
  cursor: pointer;
  color: ${(props) => props.theme.color.white};
`

const Title = styled.h4`
  color: ${(props) => props.theme.color.white};
  min-width: 16em;
`
const Reverse = styled.div`
  margin-top: -1.1em;
`
const StyledT = styled.h5`
  opacity: 66%;
  margin-bottom: -2px;
  margin-top: -0px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 13px;
`

const StyledPrice = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.3em;
  color: ${(props) => props.theme.color.grey[600]};
`
const StyledValue = styled.div`
  color: ${(props) => props.theme.color.white};
  //letter-spacing: 0.5px;
`

const StyledTableRow = styled(TableRow)`
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  margin: 0.5em;
  padding: 0em 0.3em 0.7em 0.3em;
  cursor: pointer;
`

const StyledPrices = styled(Box)`
  border-radius: 5px;
  border-width: 2px;
  border-color: ${(props) => props.theme.color.grey[600]};
  background: ${(props) => props.theme.color.white};
  border-style: solid;
  margin: 0 0.5em 0 0.5em;
  padding: 0 1em 0 1em;
`
const StyledTitle = styled.span`
  color: ${(props) => props.theme.color.grey[600]};
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-top: -0.5em;
  margin-bottom: 0.1em;
  opacity: 0.66;
  text-transform: uppercase;
`

const StyledPositionHeader = styled.a`
  display: flex;
  flex-direction: row;
  padding: 0em 0.3em 0.7em 0.3em;
  margin-left: 0.5em;
  justify-content: space-between;
  flex: 1;
`

const StyledPosition = styled(TableRow)`
  color: ${(props) => props.theme.color.white};
  padding-right: 0 !important;
  border: 1px solid ${(props) => props.theme.color.grey[500]} !important;
`

const StyledEmptyContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const StyledEmptyIcon = styled.div`
  align-items: center;
  border: 1px dashed ${(props) => props.theme.color.white};
  border-radius: 32px;
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  height: 44px;
  justify-content: center;
  width: 44px;
`

const StyledEmptyMessage = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
  margin-top: ${(props) => props.theme.spacing[3]}px;
  text-align: center;
`

const StyledLogo = styled.img`
  border-radius: 50%;
  height: 36px;
`

export default PositionsCard
