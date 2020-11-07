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
import { OrderItem as Item } from '@/contexts/Order/types'
import { ETHERSCAN_MAINNET, ETHERSCAN_RINKEBY } from '@/constants/index'
import { getBalance } from '../../../lib/erc20'
export interface TokenProps {
  option: any // replace with option type
  adds: any
}
export interface PositionsProp {
  asset: string
}
const Position: React.FC<TokenProps> = ({ option, adds }) => {
  const { chainId, library } = useWeb3React()
  const { onAddItem, item } = useOrders()
  const [address, setAddress] = useState({
    loading: true,
    long: '',
    short: '',
    LP: '',
  })

  useEffect(() => {
    const getAddress = async () => {
      try {
        console.log(library)

        setAddress({
          loading: false,
          long: option.address,
          short: redeemAddress,
          LP: redeemPair,
        })
      } catch (e) {
        const optionContract = new ethers.Contract(
          option.address,
          Option.abi,
          library
        )
        const redeemAddress = await optionContract.redeemToken()
        setAddress({
          loading: false,
          long: option.address,
          short: redeemAddress,
          LP: '',
        })
      }
    }
    getAddress()
  }, [])

  const handleClick = () => {
    onAddItem(option, '')
  }
  const longBalance = useTokenBalance(address.long)
  const shortBalance = useTokenBalance(address.short)
  const LPBalance = useTokenBalance(address.LP)

  console.log(longBalance)
  if (!address.long) return null
  const exp = new Date(parseInt(option.expiry.toString()) * 1000)

  if (longBalance !== 0 && shortBalance !== 0 && LPBalance !== 0) {
    return null
  }
  const baseUrl = chainId === 4 ? ETHERSCAN_RINKEBY : ETHERSCAN_MAINNET

  return (
    <StyledPosition onClick={handleClick}>
      <Box row justifyContent="space-between" alignItems="center">
        <span>
          {`${option.asset} ${option.isCall ? 'Call' : 'Put'} $${
            item.strike
          } ${exp.getMonth()}/${exp.getDay()} ${exp.getFullYear()}`}
        </span>
        <StyledLink href={`${baseUrl}/${option.address}`} target="_blank">
          {option.address.substr(0, 4) + '...'}
          <LaunchIcon style={{ fontSize: '14px' }} />
        </StyledLink>
      </Box>
      <Spacer size="sm" />
      <Box row justifyContent="space-between" alignItems="center">
        <span>Long {longBalance}</span>
        <span>Short {shortBalance}</span>
        <span>LP {LPBalance}</span>
      </Box>
    </StyledPosition>
  )
}

const PositionsCard: React.FC<PositionsProp> = ({ asset }) => {
  const { options, getOptions } = useOptions()
  const { onAddItem, item } = useOrders()
  const [positions, setPositions] = useState([])

  const { library, chainId, account } = useWeb3React()
  useEffect(() => {
    if (library) {
      if (asset === 'eth') {
        getOptions('WETH')
      } else {
        getOptions(asset.toLowerCase())
      }
    }
  }, [library, asset, getOptions])

  if (item.expiry) return null
  if (options.loading)
    return (
      <Card>
        <CardTitle>Your Positions</CardTitle>
        <CardContent>
          <Loader />
        </CardContent>
      </Card>
    )
  return (
    <Card>
      <CardTitle>Your Positions</CardTitle>
      <CardContent>
        {positions.map((pos, i) => {
          return <Position key={i} option={pos} />
        })}
      </CardContent>
    </Card>
  )
}
const StyledPosition = styled.a`
  border: 0px solid ${(props) => props.theme.color.grey[400]};
  background: ${(props) => props.theme.color.black};
  min-height: 2em;
  border-radius: 4px;
  padding: 0.8em;
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
  position: absolute;
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
