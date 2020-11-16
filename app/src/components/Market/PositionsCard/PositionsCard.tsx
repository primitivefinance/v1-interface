import React, { useEffect, useMemo, useState, useContext } from 'react'
import styled from 'styled-components'

import AddIcon from '@material-ui/icons/Add'

import LaunchIcon from '@material-ui/icons/Launch'

import { Protocol } from '@/lib/protocol'

import { useWeb3React } from '@web3-react/core'

import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Spacer from '@/components/Spacer'
import Box from '@/components/Box'
import Button from '@/components/Button'
import Loader from '@/components/Loader'

import {
  ETHERSCAN_MAINNET,
  ETHERSCAN_RINKEBY,
  Operation,
  getIconForMarket,
  COINGECKO_ID_FOR_MARKET,
} from '@/constants/index'

import { usePositions } from '@/state/positions/hooks'
import { useUpdateItem, useItem } from '@/state/order/hooks'
import formatEtherBalance from '@/utils/formatEtherBalance'
import formatExpiry from '@/utils/formatExpiry'
import LineItem from '@/components/LineItem'
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
      <Box row justifyContent="space-around" alignItems="center">
        <Spacer size="sm" />
        <StyledLogo
          src={getIconForMarket(option.attributes.asset.toLowerCase())}
          alt={''}
        />
        <Spacer />
        <div>
          <Spacer />
          <StyledTitle>
            {`${option.attributes.asset} ${
              option.attributes.entity.isCall ? 'Call' : 'Put'
            }`}
          </StyledTitle>
          <Reverse />
          <StyledTitle>
            {`$${option.attributes.strike} ${month}/${date} ${year}`}
          </StyledTitle>
        </div>
        <Spacer />
        <StyledLink href={`${baseUrl}/${option.address}`} target="_blank">
          {option.attributes.address.length > 0
            ? option.attributes.address.substr(0, 4) + '...'
            : '-'}
          <LaunchIcon style={{ fontSize: '14px' }} />
        </StyledLink>
        <Spacer size="sm" />
      </Box>
      <Spacer size="sm" />
      <StyledPrices row justifyContent="space-between" alignItems="center">
        <StyledPrice>
          <StyledT>Long</StyledT>
          <Spacer size="sm" />
          {formatEtherBalance(option.long)}
        </StyledPrice>
        <StyledPrice>
          <StyledT>Short</StyledT>
          <Spacer size="sm" />
          {formatEtherBalance(option.redeem)}
        </StyledPrice>
        <StyledPrice>
          <StyledT>LP</StyledT>
          <Spacer size="sm" />
          {formatEtherBalance(option.lp)}
        </StyledPrice>
      </StyledPrices>
    </StyledPosition>
  )
}

const PositionsCard: React.FC = () => {
  const item = useItem()
  const positions = usePositions()

  if (item.item.asset) return null
  if (positions.loading) {
    return <Loader size="lg" />
  }
  if (!positions.loading && !positions.exists) {
    return (
      <Card>
        <CardTitle>Active Positions</CardTitle>
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
    <Card>
      <CardTitle>Active Positions</CardTitle>
      <CardContent>
        {positions.options.map((pos, i) => {
          return <Position key={i} option={pos} />
        })}
      </CardContent>
    </Card>
  )
}

const Reverse = styled.div`
  margin-top: -1.1em;
`
const StyledT = styled.h5`
  opacity: 66%;
`

const StyledPrice = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  color: white;
`
const StyledPrices = styled(Box)`
  border-radius: 5px;
  border-width: 1px;
  border-color: ${(props) => props.theme.color.grey[500]};
  background: ${(props) => props.theme.color.black};
  border-style: solid;
  margin: 0 0.5em 0 0.5em;
  padding: 0 1em 0 1em;
`
const StyledTitle = styled.h3`
  color: ${(props) => props.theme.color.white};
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-top: -0.5em;
`
const StyledPosition = styled.a`
  border: 2px solid ${(props) => props.theme.color.grey[600]};
  border-radius: ${(props) => props.theme.borderRadius}px;
  background: ${(props) => props.theme.color.black};
  min-height: 2em;
  border-radius: 4px;
  padding-left: 0.8em;
  padding-right: 0.8em;
  padding-bottom: 1em;
  padding-top: 0.5em;
  cursor: pointer;
  margin-bottom: 0.5em;
  margin-top: 0.5em;
  &:hover {
    background: ${(props) => props.theme.color.grey[600]};
    border: 1.5px solid ${(props) => props.theme.color.grey[400]};
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
