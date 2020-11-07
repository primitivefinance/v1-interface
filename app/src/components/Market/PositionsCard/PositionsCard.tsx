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
import { isNullOrUndefined } from 'util'

export interface TokenProps {
  option: any // replace with option type
}
export interface PositionsProp {
  asset: string
}
const Position: React.FC<TokenProps> = ({ option }) => {
  const { chainId, library } = useWeb3React()
  const { onAddItem, item } = useOrders()
  const [params, setParams] = useState()
  const [position, setPos] = useState({
    loading: true,
    long: '',
    short: '',
    LP: '',
  })

  useEffect(() => {
    const getAddress = async () => {
      try {
        console.log(library)
        const optionContract = new ethers.Contract(
          option.address,
          Option.abi,
          library
        )
        const redeemAddress = await optionContract.redeemToken()
        const redeem = new Token(chainId, redeemAddress, 18)
        const redeemPair = Pair.getAddress(option.underlyingAddress, redeem)
        setPos({
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
        setPos({
          loading: false,
          long: option.address,
          short: redeemAddress,
          LP: '',
        })
      }
    }
    const getParams = async () => {
      const pm = await Protocol.getOptionParametersFromMultiCall(library, [
        option.address,
      ])
      setParams(pm[0])
    }
    getParams()
  }, [])

  const handleClick = () => {
    onAddItem(option, '')
  }
  const longBalance = parseInt(useTokenBalance(params?._strikeToken))
  const shortBalance = parseInt(useTokenBalance(params?._redeemToken))
  const LPBalance = parseInt(useTokenBalance(position.LP))

  if (!params) return null
  const exp = new Date(parseInt(option.expiry.toString()) * 1000)

  if (longBalance !== 0 && shortBalance === 0 && LPBalance === 0) {
    return null
  }
  const baseUrl = chainId === 4 ? ETHERSCAN_RINKEBY : ETHERSCAN_MAINNET

  return (
    <StyledPosition onClick={handleClick}>
      <Box row justifyContent="space-between" alignItems="center">
        <span>
          {`${option.asset} ${params.isCall ? 'Call' : 'Put'} $${
            item.strike
          } ${exp.getMonth()}/${exp.getDay()} ${exp.getFullYear()}`}
        </span>
        <StyledLink href={`${baseUrl}/${option.address}`} target="_blank">
          {option.address.substr(0, 4) + '...'}
          <LaunchIcon style={{ fontSize: '14px' }} />
        </StyledLink>
      </Box>
      <span>Long Tokens {longBalance}</span>
      <span>Short Tokens {shortBalance}</span>
      <span>LP{LPBalance}</span>
    </StyledPosition>
  )
}

const PositionsCard: React.FC<PositionsProp> = ({ asset }) => {
  const { options, getOptions } = useOptions()
  const { onAddItem, item } = useOrders()
  const [positions, setPositions] = useState()

  const { library, chainId } = useWeb3React()
  useEffect(() => {
    if (library) {
      if (asset === 'eth') {
        getOptions('WETH')
      } else {
        getOptions(asset.toLowerCase())
      }
    }
  }, [library, asset, getOptions])
  useEffect(() => {
    const getPositions = async () => {
      options.calls.map((pos) => {
        console.log('Put' + pos.address)
      })
      options.puts.map((pos) => {
        console.log('Put' + pos.address)
      })
    }
    getPositions()
  }, [positions, setPositions])
  if (item.expiry) return null
  if (options.loading) return <Loader />
  return (
    <Card>
      <CardTitle>Your Positions</CardTitle>
      <CardContent>
        {options.calls.map((pos, i) => {
          return <Position key={i} option={pos} />
        })}
        {options.puts.map((pos, i) => {
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
