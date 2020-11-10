import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import ethers from 'ethers'

import useOrders from '@/hooks/useOrders'
import useOptions from '@/hooks/useOptions'
import usePositions from '@/hooks/usePositions'
import AddIcon from '@material-ui/icons/Add'
import { Pair, Token, TokenAmount, Trade, TradeType, Route } from '@uniswap/sdk'
import useTokenBalance from '@/hooks/useTokenBalance'

import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import Option from '@primitivefi/contracts/artifacts/Option.json'
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
import EmptyTable from '../EmptyTable'
import FilledBar from '../FilledBar'
import LitContainer from '@/components/LitContainer'
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import TableCell from '@/components/TableCell'
import TableRow from '@/components/TableRow'
import Timer from '../Timer'
import {
  ETHERSCAN_MAINNET,
  ETHERSCAN_RINKEBY,
  Operation,
} from '@/constants/index'
import { getBalance } from '../../../lib/erc20'
import { OptionParameters } from '../../../lib/entities/option'
import formatEtherBalance from '@/utils/formatEtherBalance'
import formatExpiry from '@/utils/formatExpiry'
export interface TokenProps {
  option: any // replace with option type
}
export interface PositionsProp {
  asset: string
}
const Position: React.FC<TokenProps> = ({ option }) => {
  const { chainId, library } = useWeb3React()
  const { onAddItem, item } = useOrders()
  const { date, month, year } = formatExpiry(option.attributes.expiry)

  const handleClick = () => {
    onAddItem(option.attributes, Operation.NONE)
  }

  const baseUrl = chainId === 4 ? ETHERSCAN_RINKEBY : ETHERSCAN_MAINNET
  return (
    <StyledPosition onClick={handleClick}>
      <Box row justifyContent="space-between" alignItems="center">
        <StyledTitle>
          {`${option.attributes.asset} ${
            option.attributes.entity.isCall ? 'Call' : 'Put'
          } $${option.attributes.strike} ${month}/${date} ${year}`}
        </StyledTitle>
        <StyledLink href={`${baseUrl}/${option.address}`} target="_blank">
          {option.attributes.address.length > 0
            ? option.attributes.address.substr(0, 4) + '...'
            : '-'}
          <LaunchIcon style={{ fontSize: '14px' }} />
        </StyledLink>
      </Box>
      <Spacer size="sm" />
      <Box row justifyContent="space-between" alignItems="center">
        <span>Long {formatEtherBalance(option.long)}</span>
        <span>Short {formatEtherBalance(option.redeem)}</span>
        <span>LP {formatEtherBalance(option.lp)}</span>
      </Box>
    </StyledPosition>
  )
}

const PositionsCard: React.FC<PositionsProp> = ({ asset }) => {
  const { options } = useOptions()
  const { onAddItem, item } = useOrders()
  const { positions, getPositions } = usePositions()

  const { library, chainId, account } = useWeb3React()

  useEffect(() => {
    if (!options.loading) {
      const temp = options.calls.concat(options.puts)
      getPositions(temp)
    }
  }, [getPositions, options])

  if (item.expiry) return null
  if (positions.loading) {
    return <Loader size="lg" />
  }
  if (!positions.loading && !positions.exists) {
    return (
      <Card>
        <CardTitle>Your Positions</CardTitle>
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
      <CardTitle>Your Positions</CardTitle>
      <CardContent>
        {positions.options.map((pos, i) => {
          return <Position key={i} option={pos} />
        })}
      </CardContent>
    </Card>
  )
}

const StyledTitle = styled.h3`
  color: ${(props) => props.theme.color.white};
`
const StyledPosition = styled.a`
  border: 0px solid ${(props) => props.theme.color.grey[400]};
  background: ${(props) => props.theme.color.black};
  min-height: 2em;
  border-radius: 4px;
  padding-left: 0.8em;
  padding-right: 0.8em;
  padding-bottom: 1em;
  cursor: pointer;
  margin-bottom: 0.5em;
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

export default PositionsCard
