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

import { useWeb3React } from '@web3-react/core'

import { OrderItem } from '@/contexts/Order/types'
import { destructureOptionSymbol } from '@/lib/utils'

import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Spacer from '@/components/Spacer'
import Button from '@/components/Button'
import EmptyTable from '../EmptyTable'
import FilledBar from '../FilledBar'
import LitContainer from '@/components/LitContainer'
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import TableCell from '@/components/TableCell'
import TableRow from '@/components/TableRow'
import Timer from '../Timer'
import { OrderItem as Item } from '@/contexts/Order/types'

export interface TokenProps {
  option: any // replace with option type
}
export interface PositionsProp {
  asset: string
}
const Position: React.FC<TokenProps> = ({ option }) => {
  const { positions, getPositions } = usePositions()
  const { chainId, library } = useWeb3React()
  const [balanceAddress, setBalanceAddress] = useState({
    longT: '',
    shortT: '',
    LP: '',
  })

  useEffect(() => {
    const getAddresses = async () => {
      const stablecoinAddress = '0xb05cB19b19e09c4c7b72EA929C8CfA3187900Ad2'
      const tokenA = new Token(chainId, stablecoinAddress, 18)

      const optionContract = new ethers.Contract(
        option.address,
        Option.abi,
        library
      )
      const redeemAddress = await optionContract.redeemToken()
      const redeem = new Token(chainId, redeemAddress, 18)
      const redeemPair = Pair.getAddress(tokenA, redeem)

      try {
        const LPAddress = await new ethers.Contract(
          redeemPair,
          IUniswapV2Pair.abi,
          library
        )
        return {
          longT: option.address,
          shortT: redeemAddress,
          LP: LPAddress.liquidityToken,
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (option.address) {
      getAddresses().then((add) => setBalanceAddress(add))
    }
  }, [getPositions, positions, balanceAddress, setBalanceAddress])

  const longBalance = useTokenBalance(balanceAddress.longT)
  const shortBalance = useTokenBalance(balanceAddress.shortT)
  const LPBalance = useTokenBalance(balanceAddress.LP)

  if (longBalance || shortBalance || LPBalance) {
    return (
      <StyledPosition>
        <span>{option.symbol}</span>
        <span>{option.address}</span>
        <span>Long Tokens {longBalance}</span>
        <span>Short Tokens {shortBalance}</span>
        <span>LP{LPBalance}</span>
      </StyledPosition>
    )
  }
  return (
    <Card>
      <CardTitle>Your Positions</CardTitle>
      <CardContent>Loading...</CardContent>
    </Card>
  )
}
const PositionsCard: React.FC<PositionsProp> = ({ asset }) => {
  const { options, getOptions } = useOptions()
  const { positions, getPositions } = usePositions()
  const { item } = useOrders()
  const { library, chainId, account } = useWeb3React()

  useEffect(() => {
    if (library) {
      getOptions(asset.toLowerCase())
    }
  }, [getOptions, library, asset])

  useEffect(() => {
    if (positions.calls[0].address || positions.puts[0].address) {
      getPositions(asset.toLowerCase(), options)
    }
  }, [getPositions, library])

  if (item.id || item.asset) return null
  if (positions.calls[0].address || positions.puts[0].address) {
    return (
      <Card>
        <CardTitle>Your Positions</CardTitle>
        <CardContent>
          {positions.calls.map((pos, i) => {
            console.log(pos)
            return <Position key={i} option={pos} />
          })}
        </CardContent>
      </Card>
    )
  }
  return (
    <>
      <Card>
        <CardTitle>Your Positions</CardTitle>
        <CardContent>
          <StyledEmptyContent>
            <StyledEmptyIcon>
              <AddIcon />
            </StyledEmptyIcon>
            <StyledEmptyMessage>
              Click an option to open an position
            </StyledEmptyMessage>
          </StyledEmptyContent>
        </CardContent>
      </Card>
    </>
  )
}

const StyledPosition = styled.div`
  border: 1px solid ${(props) => props.theme.color.grey[400]};
  background: ${(props) => props.theme.color.black};
  min-height: 2em;
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
