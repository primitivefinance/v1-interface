import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import ethers from 'ethers'
import { Pair, Token, TokenAmount, Trade, TradeType, Route } from '@uniswap/sdk'
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'

import Label from '@/components/Label'
import Button from '@/components/Button'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import Loader from '@/components/Loader'
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

const LPOptions: React.FC<{ balance?: any }> = ({ balance }) => {
  const { item, onChangeItem } = useOrders()
  const change = (t: Operation) => {
    onChangeItem(item, t)
  }

  const reserve0Units =
    item.token0 === item.entity.assetAddresses[0]
      ? item.asset.toUpperCase()
      : 'SHORT'
  return (
    <StyledBottom>
      <StyledSubtitle>Liquidity Provision</StyledSubtitle>
      <Spacer size="sm" />
      <MultiLineItem label={'Reserves'}>
        {reserve0Units === item.asset.toUpperCase()
          ? formatEtherBalance(item.reserves[0].toString())
          : formatEtherBalance(item.reserves[1].toString())}{' '}
        {item.asset.toUpperCase()} /{' '}
        {reserve0Units === item.asset.toUpperCase()
          ? formatEtherBalance(item.reserves[1].toString())
          : formatEtherBalance(item.reserves[0].toString())}{' '}
        {'SHORT'}
      </MultiLineItem>
      <Spacer />
      <LineItem
        label={'LP Token Balance'}
        data={balance ? formatEtherBalance(balance).toString() : '0.00'}
        units={'UNI-V2'}
      />
      <Spacer />
      <Box row justifyContent="center" alignItems="center">
        <Button size="sm" onClick={() => change(Operation.ADD_LIQUIDITY)}>
          Provide Liquidity
        </Button>
        <Spacer size="sm" />
        {balance !== '0x00' ? (
          <Button size="sm" variant="secondary" disabled>
            Withdraw Liquidity
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => change(Operation.REMOVE_LIQUIDITY)}
          >
            Withdraw Liquidity
          </Button>
        )}
      </Box>
    </StyledBottom>
  )
}
const OrderOptions: React.FC = () => {
  const { item, onChangeItem } = useOrders()
  const { positions } = usePositions()

  const [option, setOption] = useState({})
  useEffect(() => {
    const temp = positions.options.filter(
      (opt) => opt.attributes.address === item.address
    )[0]
    console.log({ temp })
    if (temp) {
      if (temp.long || temp.redeem || temp.lp) {
        setOption({ long: temp.long, short: temp.redeem, lp: temp.lp })
      }
    }
  }, [setOption, positions, item])

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
            <StyledBalance>
              {positions.loading ? (
                <Loader size="sm" />
              ) : !option ? (
                '0.00'
              ) : (
                formatEtherBalance(option?.long)
              )}
            </StyledBalance>
          </Box>
          <Button full size="sm" onClick={() => change(Operation.LONG)}>
            Open Long
          </Button>
          <Spacer size="sm" />
          <Button
            full
            disabled={!positions.loading ? false : true}
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
            <StyledBalance>
              {positions.loading ? (
                <Loader size="sm" />
              ) : !option ? (
                '0.00'
              ) : (
                formatEtherBalance(option?.short)
              )}
            </StyledBalance>
          </Box>
          <Button full size="sm" onClick={() => change(Operation.SHORT)}>
            Open Short
          </Button>
          <Spacer size="sm" />
          <Button
            full
            disabled={!positions.loading ? false : true}
            size="sm"
            variant="secondary"
            onClick={() => change(Operation.CLOSE_SHORT)}
          >
            Close Short
          </Button>
          <Spacer />
        </StyledColumn>
      </Box>
      <LPOptions balance={option?.lp ? option.lp : null} />
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

const StyledReserves = styled(Box)`
  color: ${(props) => props.theme.color.white};
`

export default OrderOptions
