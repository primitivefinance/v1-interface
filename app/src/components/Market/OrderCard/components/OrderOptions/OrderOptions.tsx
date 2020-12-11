import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { formatEther } from 'ethers/lib/utils'
import { Token, TokenAmount } from '@uniswap/sdk'

import Label from '@/components/Label'
import Button from '@/components/Button'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import Loader from '@/components/Loader'

import LineItem from '@/components/LineItem'
import MultiLineItem from '@/components/MultiLineItem'
import { Operation } from '@/constants/index'
import formatEtherBalance from '@/utils/formatEtherBalance'
import { useReserves } from '@/hooks/data/useReserves'
import { useItem, useUpdateItem } from '@/state/order/hooks'
import { usePositions } from '@/state/positions/hooks'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'

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
  const reserve0Units =
    item.token0 === item.entity.underlying.address
      ? item.asset.toUpperCase()
      : 'SHORT'
  return (
    <>
      <Box row alignItems="center" justifyContent="space-between">
        <LineItem
          label={'LP'}
          data={balance ? formatEther(balance) : '0'}
          units={'UNI-V2'}
        />
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
    const temp = positions.options.filter(
      (opt) => opt.attributes.address === item.address
    )[0]
    if (temp) {
      if (temp.long || temp.redeem || temp.lp) {
        setOption({ long: temp.long, short: temp.redeem, lp: temp.lp })
      }
    } else {
      setOption({ long: null, short: null, lp: null })
    }
  }, [setOption, positions, item])
  const change = (t: Operation) => {
    updateItem(item, t)
  }

  return (
    <>
      <Box column alignItems="flex-start" justifyContent="center">
        <StyledOrder
          onClick={() =>
            setOrder({ long: !order.long, short: false, lp: false })
          }
        >
          {!positions.loading ? (
            <Box row alignItems="center" justifyContent="space-between">
              <LineItem
                label={'Long'}
                data={option.long ? formatEther(option.long).toString() : '0'}
                units={''}
              />
              <Spacer size="sm" />
              {!order.long ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </Box>
          ) : (
            <Loader size="sm" />
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
                  onClick={() => change(Operation.WRITE)}
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
                label={'Short'}
                data={option.short ? formatEther(option.short).toString() : '0'}
                units={''}
              />
              <Spacer size="sm" />
              {!order.short ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </Box>
          ) : (
            <Loader size="sm" />
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

const StyledOrder = styled.a`
  border: 1px solid ${(props) => props.theme.color.grey[800]};
  box-shadow: -2px 2px 2px rgba(250, 250, 250, 0.1);
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
