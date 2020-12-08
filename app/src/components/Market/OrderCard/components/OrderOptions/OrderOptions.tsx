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

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

const LPOptions: React.FC<{ balance?: any }> = ({ balance }) => {
  const { item } = useItem()
  const updateItem = useUpdateItem()
  const underlyingToken: Token = new Token(
    item.entity.chainId,
    item.entity.assetAddresses[0],
    18,
    item.entity.isPut ? 'DAI' : item.asset.toUpperCase()
  )
  const lpPair = useReserves(
    underlyingToken,
    new Token(item.entity.chainId, item.entity.assetAddresses[2], 18, 'SHORT')
  ).data
  const change = (t: Operation) => {
    if (t === Operation.REMOVE_LIQUIDITY_CLOSE) {
      console.log(lpPair)
      updateItem(item, t, lpPair)
    } else {
      updateItem(item, t)
    }
  }
  const reserve0Units =
    item.token0 === item.entity.assetAddresses[0]
      ? item.asset.toUpperCase()
      : 'SHORT'
  return (
    <>
      <Spacer />
      <LineItem
        label={'LP Balance'}
        data={balance ? formatEther(balance) : '0'}
        units={'UNI-V2'}
      />
      <Spacer />
      <Box row justifyContent="center" alignItems="center">
        <Button full size="sm" onClick={() => change(Operation.ADD_LIQUIDITY)}>
          Provide
        </Button>
        <Spacer />
        <Button
          full
          size="sm"
          variant="secondary"
          onClick={() => change(Operation.REMOVE_LIQUIDITY_CLOSE)}
          disabled={
            balance ? (formatEther(balance) !== '0.00' ? false : true) : true
          }
        >
          Withdraw
        </Button>
      </Box>
    </>
  )
}

const OrderOptions: React.FC = () => {
  const [tab, setTab] = useState(0)
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

    console.log(orderType)
  }

  return (
    <>
      <Reverse />
      <Box row alignItems="flex-start" justifyContent="center">
        <StyledTabs selectedIndex={tab} onSelect={(index) => setTab(index)}>
          <StyledTabList>
            <StyledTab active={tab === 0}>Long</StyledTab>
            <StyledTab active={tab === 1}>Short</StyledTab>
            <StyledTab active={tab === 2}>Liquidity</StyledTab>
          </StyledTabList>
          <Spacer />
          <TabPanel>
            <StyledColumn>
              <Spacer />
              <Box row justifyContent="flex-start" alignItems="center">
                {!positions.loading ? (
                  <LineItem
                    label={'Long Balance'}
                    data={
                      option.long ? formatEther(option.long).toString() : '0'
                    }
                    units={'LONG'}
                  />
                ) : (
                  <Loader size="sm" />
                )}
              </Box>
              <Spacer />
              <Box row justifyContent="space-between" alignItems="center">
                <Button full size="sm" onClick={() => change(Operation.LONG)}>
                  Buy
                </Button>
                <Spacer size="sm" />
                <Button
                  full
                  disabled={false}
                  size="sm"
                  variant="secondary"
                  onClick={() => change(Operation.CLOSE_LONG)}
                >
                  Sell
                </Button>
                <Spacer size="sm" />
                <Button
                  full
                  disabled={
                    option.long
                      ? formatEther(option.short) !== '0.00'
                        ? false
                        : true
                      : true
                  }
                  size="sm"
                  variant="secondary"
                  onClick={() => change(Operation.WRITE)}
                >
                  Write
                </Button>
              </Box>
            </StyledColumn>
          </TabPanel>
          <TabPanel>
            <StyledColumn>
              <Spacer />
              <Box row justifyContent="flex-start" alignItems="center">
                {!positions.loading ? (
                  <LineItem
                    label={'Short Balance'}
                    data={option.short ? formatEther(option.short) : '0'}
                    units={'SHORT'}
                  />
                ) : (
                  <Loader size="sm" />
                )}
              </Box>
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
            </StyledColumn>
          </TabPanel>
          <TabPanel>
            <StyledColumn>
              <LPOptions balance={option.lp ? option.lp : '0'} />
            </StyledColumn>
          </TabPanel>
        </StyledTabs>
      </Box>
    </>
  )
}

const StyledTabs = styled(Tabs)`
  width: 100%;
`
const Reverse = styled.div`
  margin-top: -2.1em;
`

const StyledTabList = styled(TabList)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: baseline;
  margin-left: -2.5em;
`

interface TabProps {
  active?: boolean
}

const StyledTab = styled(Tab)<TabProps>`
  background-color: ${(props) =>
    !props.active ? props.theme.color.grey[800] : props.theme.color.black};
  color: ${(props) =>
    !props.active ? props.theme.color.grey[400] : props.theme.color.white};
  font-weight: ${(props) => (props.active ? 600 : 500)};
  padding: 0.5em 0.5em 0.5em 1em;
  border-radius: 0.3em 0.3em 0 0;
  border-width: 1px 1px 0 1px;
  border-style: solid;
  border-color: ${(props) => props.theme.color.grey[600]};
  width: 34%;
  list-style: none;
  cursor: pointer;
`

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -2.5em;
  border-radius: 0.3em 0 0 0;
  border-width: 1px 1px 1px 1px;
  border-style: solid;
  padding: 0em 1em 1em 1em;
  border-color: ${(props) => props.theme.color.grey[600]};
  background: ${(props) => props.theme.color.black};
`

export default OrderOptions
