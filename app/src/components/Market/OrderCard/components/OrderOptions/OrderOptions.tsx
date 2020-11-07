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
import useOptions from '@/hooks/useOptions'
import usePositions from '@/hooks/usePositions'
import Option from '@primitivefi/contracts/artifacts/Option.json'

import LineItem from '@/components/LineItem'
import MultiLineItem from '@/components/MultiLineItem'
import TableRow from '../../../../TableRow/TableRow'
import formatBalance from '@/utils/formatBalance'
import { useWeb3React } from '@web3-react/core'
import { Operation } from '@/constants/index'
import formatEtherBalance from '@/utils/formatEtherBalance'

const LPOptions: React.FC = () => {
  const balance = false
  const { item, onChangeItem } = useOrders()
  const pairBalance = useTokenBalance(item.entity.pair)
  const change = (t: Operation) => {
    onChangeItem(item, t)
  }
  return (
    <StyledBottom>
      <StyledSubtitle>Liquidity Provision</StyledSubtitle>
      <Spacer size="sm" />
      <MultiLineItem label={'Reserves'}>
        {' '}
        {`${formatEtherBalance(item.reserves[0])} / ${formatEtherBalance(
          item.reserves[1]
        )}`}
      </MultiLineItem>
      <Spacer />
      <LineItem label={'LP Token Balance'} data={pairBalance.toString()} />
      <Spacer />
      <Box row justifyContent="space-between" alignItems="center">
        <Button size="sm" onClick={() => change(Operation.ADD_LIQUIDITY)}>
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
            onClick={() => change(Operation.REMOVE_LIQUIDITY)}
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

  const longBalance = useTokenBalance(item.address)
  const shortBalance = useTokenBalance(item.entity.assetAddresses[2])
  const underlyingBalance = useTokenBalance(item.entity.assetAddresses[0])
  const strikeBalance = useTokenBalance(item.entity.assetAddresses[1])

  const change = (t: Operation) => {
    onChangeItem(item, t)
  }

  return (
    <>
      <Box row alignItems="flex-start" justifyContent="center">
        <StyledColumn>
          <Box row justifyContent="center" alignItems="center">
            <Label text={'Long Tokens'} />
            <Spacer />
            <StyledBalance>{formatBalance(longBalance)}</StyledBalance>
          </Box>
          <Button full size="sm" onClick={() => change(Operation.LONG)}>
            Open Long
          </Button>
          <Spacer size="sm" />
          <Button
            full
            disabled={longBalance ? false : true}
            size="sm"
            variant="secondary"
            onClick={() => change(Operation.CLOSE_LONG)}
          >
            Close Long
          </Button>
        </StyledColumn>

        <StyledColumn>
          <Box row justifyContent="center" alignItems="center">
            <Label text={'Short Tokens'} />
            <Spacer />
            <StyledBalance>{formatBalance(shortBalance)}</StyledBalance>
          </Box>
          <Button full size="sm" onClick={() => change(Operation.SHORT)}>
            Open Short
          </Button>
          <Spacer size="sm" />
          <Button
            full
            disabled={shortBalance ? false : true}
            size="sm"
            variant="secondary"
            onClick={() => change(Operation.CLOSE_SHORT)}
          >
            Close Short
          </Button>
          <Spacer />
        </StyledColumn>
      </Box>
      <LPOptions />
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
