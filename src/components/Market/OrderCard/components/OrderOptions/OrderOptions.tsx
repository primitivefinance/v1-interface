import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { formatEther } from 'ethers/lib/utils'
import { Token, TokenAmount } from '@sushiswap/sdk'

import Button from '@/components/Button'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'

import LineItem from '@/components/LineItem'
import { Operation } from '@primitivefi/sdk'
import { useReserves } from '@/hooks/data/useReserves'
import { useItem, useUpdateItem } from '@/state/order/hooks'
import { usePositions } from '@/state/positions/hooks'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import LaunchIcon from '@material-ui/icons/Launch'
import {
  ADDRESS_FOR_MARKET,
  ETHERSCAN_MAINNET,
  ETHERSCAN_RINKEBY,
} from '@/constants/index'

const LPOptions: React.FC<{ balance?: any; open?: boolean }> = ({
  balance,
  open,
}) => {
  const { item } = useItem()
  const updateItem = useUpdateItem()
  const underlyingToken: Token = new Token(
    item.entity.chainId,
    item.entity.underlying.address,
    18,
    item.entity.isPut ? 'DAI' : item.asset.toUpperCase()
  )
  const lpPair = useReserves(underlyingToken, item.entity.redeem).data
  const change = (t: Operation) => {
    if (t === Operation.REMOVE_LIQUIDITY_CLOSE) {
      updateItem(item, t, lpPair)
    } else {
      updateItem(item, t)
    }
  }

  const baseUrl =
    item.market.liquidityToken.chainId === 4
      ? ETHERSCAN_RINKEBY
      : ETHERSCAN_MAINNET
  return (
    <>
      <Box row alignItems="center" justifyContent="space-between">
        <LineItem
          label={'Liquidity'}
          data={balance ? formatEther(balance) : '0'}
          units={'SLP'}
        />
        <Spacer size="sm" />
        <StyledARef
          href={`${baseUrl}/${item.market.liquidityToken.address}`}
          target="__blank"
        >
          <LaunchIcon style={{ fontSize: '14px' }} />
        </StyledARef>
        <Spacer size="sm" />
        {!open ? <ExpandMoreIcon /> : <ExpandLessIcon />}
      </Box>
      {open ? (
        <>
          <Spacer />
          <Box row justifyContent="center" alignItems="center">
            <Button
              full
              size="sm"
              onClick={() => change(Operation.ADD_LIQUIDITY)}
            >
              Provide
            </Button>
            <Spacer />
            <Button
              full
              size="sm"
              variant="secondary"
              onClick={() => change(Operation.REMOVE_LIQUIDITY_CLOSE)}
              disabled={
                balance
                  ? formatEther(balance) !== '0.00'
                    ? false
                    : true
                  : true
              }
            >
              Withdraw
            </Button>
          </Box>
        </>
      ) : null}
    </>
  )
}

const OrderOptions: React.FC = () => {
  const [order, setOrder] = useState({ long: false, short: false, lp: false })
  const { item, orderType, approved } = useItem()
  const updateItem = useUpdateItem()
  const positions = usePositions()
  const [option, setOption] = useState({ long: null, short: null, lp: null })
  useEffect(() => {
    if (!positions.loading) {
      const temp = positions.options.filter(
        (opt) => opt.attributes.entity.address === item.entity.address
      )[0]
      if (temp) {
        if (temp.long || temp.redeem || temp.lp) {
          setOption({ long: temp.long, short: temp.redeem, lp: temp.lp })
        }
      } else {
        setOption({ long: null, short: null, lp: null })
      }
    }
  }, [setOption, positions, item])
  const change = (t: Operation) => {
    updateItem(item, t)
  }
  const baseUrl =
    item.entity.chainId === 4 ? ETHERSCAN_RINKEBY : ETHERSCAN_MAINNET
  return (
    <>
      <Spacer size="sm" />
      <Box column alignItems="center" justifyContent="center">
        <StyledOrder
          onClick={() =>
            setOrder({ long: !order.long, short: false, lp: false })
          }
        >
          {!positions.loading ? (
            <Box row alignItems="center" justifyContent="space-between">
              <LineItem
                label={'LONG'}
                data={option.long ? formatEther(option.long).toString() : '0'}
                units={''}
              />
              <Spacer size="sm" />
              <StyledARef
                href={`${baseUrl}/${item.entity.address}`}
                target="__blank"
              >
                <LaunchIcon style={{ fontSize: '14px' }} />
              </StyledARef>
              <Spacer size="sm" />
              {!order.long ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </Box>
          ) : (
            <Box row alignItems="center" justifyContent="space-between">
              <LineItem label={'LONG'} loading={true} />
              <Spacer size="sm" />
              {!order.long ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </Box>
          )}
          {order.long ? (
            <>
              <Spacer />
              <Box row justifyContent="space-between" alignItems="center">
                <Button full size="sm" onClick={() => change(Operation.LONG)}>
                  Buy
                </Button>
                <Spacer size="sm" />
                <Button
                  full
                  disabled={
                    option.short
                      ? formatEther(option.short) !== '0.00'
                        ? false
                        : true
                      : true
                  }
                  size="sm"
                  variant="secondary"
                  onClick={() => change(Operation.CLOSE_LONG)}
                >
                  Sell
                </Button>
                <Spacer size="sm" />
                <Button
                  full
                  disabled={false}
                  size="sm"
                  variant="secondary"
                  onClick={() => change(Operation.SHORT)}
                >
                  Write
                </Button>
              </Box>
            </>
          ) : null}
        </StyledOrder>
        <StyledOrder
          onClick={() =>
            setOrder({ long: false, short: !order.short, lp: false })
          }
        >
          {!positions.loading ? (
            <Box row alignItems="center" justifyContent="space-between">
              <LineItem
                label={'SHORT'}
                data={option.short ? formatEther(option.short).toString() : '0'}
                units={''}
              />
              <Spacer size="sm" />
              <StyledARef
                href={`${baseUrl}/${item.entity.redeem.address}`}
                target="__blank"
              >
                <LaunchIcon style={{ fontSize: '14px' }} />
              </StyledARef>
              <Spacer size="sm" />
              {!order.short ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </Box>
          ) : (
            <Box row alignItems="center" justifyContent="space-between">
              <LineItem label={'SHORT'} loading={true} />
              <Spacer size="sm" />
              {!order.short ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </Box>
          )}
          {order.short ? (
            <>
              <Spacer />
              <Box row justifyContent="space-between" alignItems="center">
                <Button full size="sm" onClick={() => change(Operation.SHORT)}>
                  Buy
                </Button>
                <Spacer />
                <Button
                  full
                  disabled={
                    option.short
                      ? formatEther(option.short) !== '0.00'
                        ? false
                        : true
                      : true
                  }
                  size="sm"
                  variant="secondary"
                  onClick={() => change(Operation.CLOSE_SHORT)}
                >
                  Sell
                </Button>
              </Box>
            </>
          ) : null}
        </StyledOrder>
        <StyledOrder
          onClick={() => setOrder({ long: false, short: false, lp: !order.lp })}
        >
          <LPOptions balance={option.lp ? option.lp : '0'} open={order.lp} />
        </StyledOrder>
      </Box>
    </>
  )
}

const StyledARef = styled.a`
  color: ${(props) => props.theme.color.grey[400]};
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.color.white};
  }
`

const StyledOrder = styled.a`
  border: 1px solid ${(props) => props.theme.color.grey[800]};
  box-shadow: 2px 2px 2px rgba(250, 250, 250, 0.05);
  background: ${(props) => props.theme.color.black};
  color: white;
  border-radius: 0.5em;
  min-height: 1.3em;
  cursor: pointer;
  margin-bottom: 0.5em;
  padding: 1em;
  width: 90%;
  &:hover {
    border: 1px solid ${(props) => props.theme.color.grey[600]};
    background: ${(props) => props.theme.color.grey[800]};
  }
`

export default OrderOptions
