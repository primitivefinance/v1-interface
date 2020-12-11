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
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Spacer from '@/components/Spacer'
import IconButton from '@/components/IconButton'
import Box from '@/components/Box'
import Button from '@/components/Button'
import Loader from '@/components/Loader'

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
  const { date, month, year } = formatExpiry(option.attributes.expiry)

  const handleClick = () => {
    updateItem(option.attributes, Operation.NONE)
  }

  const baseUrl = chainId === 4 ? ETHERSCAN_RINKEBY : ETHERSCAN_MAINNET

  return (
    <StyledPosition onClick={handleClick}>
      <Spacer />
      <Box row justifyContent="flex-start" alignItems="center">
        <Spacer size="sm" />
        <Box row justifyContent="space-between" alignItems="center">
          <StyledTitle>
            {`${option.attributes.asset} ${
              option.attributes.entity.isCall ? 'Call' : 'Put'
            } `}
            {`${numeral(option.attributes.strike).format(
              '$0.00a'
            )} ${month}/${date}/${year}`}
          </StyledTitle>
        </Box>
      </Box>
      <StyledPrices row justifyContent="space-between" alignItems="center">
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
      </StyledPrices>
    </StyledPosition>
  )
}

const PositionsCard: React.FC = () => {
  const item = useItem()
  const positions = usePositions()
  const [open, setOpen] = useState(true)

  if (item.item.asset) {
    return null
  }
  if (positions.loading) {
    return (
      <Box column alignItems="center">
        <Spacer />
        <Loader size="lg" />
      </Box>
    )
  }
  if (!positions.loading && !positions.exists) {
    return (
      <Card border>
        <Reverse />
        <CardTitle>
          <div>
            <Title>Active Positions</Title>
          </div>
        </CardTitle>
        <CardContent>
          <StyledEmptyContent>
            <StyledEmptyIcon>
              <AddIcon />
            </StyledEmptyIcon>
            <StyledEmptyMessage>
              Click an option to open a position
            </StyledEmptyMessage>
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
              <Title>{`Active Positions (${positions.options.length})`}</Title>
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
              {positions.options.map((pos, i) => {
                return <Position key={i} option={pos} />
              })}
            </CardContent>
          </Scroll>
        )}
      </Card>
    </div>
  )
}

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
`

const Title = styled.h4`
  color: white;
  min-width: 16em;
`
const Reverse = styled.div`
  margin-top: -1.1em;
`
const StyledT = styled.h5`
  opacity: 66%;
  margin-bottom: -2px;
  margin-top: -0px;
`

const StyledPrice = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.3em;
  color: white;
`
const StyledPrices = styled(Box)`
  border-radius: 5px;
  border-width: 2px;
  border-color: ${(props) => props.theme.color.grey[600]};
  background: ${(props) => props.theme.color.black};
  border-style: solid;
  margin: 0 0.5em 0 0.5em;
  padding: 0 1em 0 1em;
`
const StyledTitle = styled.h4`
  color: ${(props) => props.theme.color.white};
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-top: -0.5em;
  margin-bottom: 0em;
`
const StyledPosition = styled.a`
  border: 1.5px solid ${(props) => props.theme.color.grey[800]};
  border-radius: 0.5em;
  min-height: 1.3em;
  cursor: pointer;
  margin-bottom: 0.3em;
  margin-top: -0.5em;
  padding: 0em 0.5em 0.5em 0.5em;
  &:hover {
    border: 1.5px solid ${(props) => props.theme.color.grey[800]};
    box-shadow: -2px 2px 2px rgba(250, 250, 250, 0.1);
    background: ${(props) => props.theme.color.black};
  }
`
const StyledLink = styled.a`
  text-decoration: none;
  cursor: grab;
  color: ${(props) => props.theme.color.grey[400]};
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
  color: ${(props) => props.theme.color.white};
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
