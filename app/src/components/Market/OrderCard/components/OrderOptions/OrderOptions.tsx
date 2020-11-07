import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import ethers from 'ethers'
import { Pair, Token, TokenAmount, Trade, TradeType, Route } from '@uniswap/sdk'
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'

import Label from '@/components/Label'
import Button from '@/components/Button'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import useOrders from '@/hooks/useOrders'
import useTokenBalance from '@/hooks/useTokenBalance'
import usePositions from '@/hooks/usePositions'
import Option from '@primitivefi/contracts/artifacts/Option.json'

import LineItem from '@/components/LineItem'
import TableRow from '../../../../TableRow/TableRow'
import formatBalance from '@/utils/formatBalance'
import { useWeb3React } from '@web3-react/core'
import { useReserves } from '@/hooks/data/useReserves'

interface LPOptionProps {
  tokenA: Token
  tokenB: Token
  LPAddress?: string
}
const LPOptions: React.FC<LPOptionProps> = ({ tokenA, tokenB, LPAddress }) => {
  const { chainId, library } = useWeb3React()
  const { data: pair } = useReserves(tokenA, tokenB)
  const balance = false
  const { item, onChangeItem } = useOrders()
  console.log(pair.reserve0)
  const change = (t: string) => {
    onChangeItem(item, t)
  }
  return (
    <StyledBottom>
      <StyledSubtitle>
        Liquidity Provision {pair ? pair.reserve0.denominator : null}
      </StyledSubtitle>
      <Spacer size="sm" />
      <LineItem label={'Reserves'} data={0} />
      <Spacer />
      <LineItem label={'LP Token Balance'} data={0} />
      <Spacer />
      <Box row justifyContent="space-around" alignItems="center">
        <Button size="sm" onClick={() => change('ADD_LIQUIDITY')}>
          Provide Liquidity
        </Button>
        <Spacer size="sm" />
        {balance ? (
          <Button size="sm" variant="secondary" disabled>
            Withdraw
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => change('REMOVE_LIQUIDITY')}
          >
            Withdraw
          </Button>
        )}
      </Box>
    </StyledBottom>
  )
}
const OrderOptions: React.FC = () => {
  const { item, onChangeItem } = useOrders()
  const { chainId, library } = useWeb3React()
  const tokenA = new Token(chainId, item.address, 18)
  const tokenB = new Token(chainId, item.underlyingAddress, 18)

  const [balanceAddress, setBalanceAddress] = useState({
    longT: '',
    shortT: '',
  })

  const longBalance = useTokenBalance(balanceAddress.longT)
  const shortBalance = useTokenBalance(balanceAddress.shortT)

  const change = (t: string) => {
    onChangeItem(item, t)
  }

  return (
    <>
      <Box row alignItems="flex-start" justifyContent="center">
        <StyledColumn>
          <Box row justifyContent="center" alignItems="center">
            <Label text={'Long Tokens'} />
            <StyledBalance>{formatBalance(longBalance)}</StyledBalance>
          </Box>
          <Button full size="sm" onClick={() => change('LONG')}>
            Open Long
          </Button>
          <Spacer size="sm" />
          <Button
            full
            disabled={longBalance ? false : true}
            size="sm"
            variant="secondary"
            onClick={() => change('CLOSE_LONG')}
          >
            Close Long
          </Button>
        </StyledColumn>
        <StyledColumn>
          <Box row justifyContent="center" alignItems="center">
            <Label text={'Short Tokens'} />
            <StyledBalance>{formatBalance(shortBalance)}</StyledBalance>
          </Box>
          <Button full size="sm" onClick={() => change('SHORT')}>
            Open Short
          </Button>
          <Spacer size="sm" />
          <Button
            full
            disabled={shortBalance ? false : true}
            size="sm"
            variant="secondary"
            onClick={() => change('CLOSE_SHORT')}
          >
            Close Short
          </Button>
          <Spacer />
        </StyledColumn>
      </Box>
      <LPOptions tokenA={tokenA} tokenB={tokenB} />
    </>
  )
}

const StyledColumn = styled.div`
  display: flex;
  padding-left: 1em;
  padding-right: 1em;
  flex-direction: column;
  width: 40%;
`

const StyledBalance = styled.h5`
  color: ${(props) => props.theme.color.white};
  padding-left: 1em;
`
const StyledSubtitle = styled.h3`
  color: ${(props) => props.theme.color.white};
`
const StyledBottom = styled.div`
  padding: 0 2em 1em 2em;
  background: black;
  border-width: 1px;
  border-radius: 5px;
  border-color: ${(props) => props.theme.color.grey[400]};
  border-style: solid;
`

export default OrderOptions
