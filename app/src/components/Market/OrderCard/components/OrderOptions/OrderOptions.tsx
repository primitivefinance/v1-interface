import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { formatEther } from 'ethers/lib/utils'

import Label from '@/components/Label'
import Button from '@/components/Button'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import Loader from '@/components/Loader'

import LineItem from '@/components/LineItem'
import MultiLineItem from '@/components/MultiLineItem'
import { Operation } from '@/constants/index'
import formatEtherBalance from '@/utils/formatEtherBalance'

import { useItem, useUpdateItem } from '@/state/order/hooks'
import { usePositions } from '@/state/positions/hooks'

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

const LPOptions: React.FC<{ balance?: any }> = ({ balance }) => {
  const { item } = useItem()
  const updateItem = useUpdateItem()
  const change = (t: Operation) => {
    updateItem(item, t)
  }
  const reserve0Units =
    item.token0 === item.entity.assetAddresses[0]
      ? item.asset.toUpperCase()
      : 'SHORT'
  return (
    <>
      <Spacer size="sm" />
      <Box row justifyContent="space-between" alignItems="center">
        <Label text={'Reserves'} />
        <Spacer />
        <StyledR>
          <StyledT>
            {reserve0Units === item.asset.toUpperCase()
              ? formatEtherBalance(item.reserves[0].toString())
              : formatEtherBalance(item.reserves[1].toString())}{' '}
            <Units>{item.asset.toUpperCase()}</Units>
          </StyledT>
          <Spacer size="sm" />
          <span>
            {reserve0Units === item.asset.toUpperCase()
              ? formatEtherBalance(item.reserves[1].toString())
              : formatEtherBalance(item.reserves[0].toString())}{' '}
            <Units>Short</Units>
          </span>
        </StyledR>
      </Box>

      <Spacer />
      <LineItem
        label={'LP Balance'}
        data={balance ? formatEther(balance).toString() : '0'}
        units={'UNI-V2'}
      />
      <Spacer />
      <Box row justifyContent="center" alignItems="center">
        <Button size="sm" onClick={() => change(Operation.ADD_LIQUIDITY)}>
          Provide
        </Button>
        <Spacer />
        {!balance ? (
          <Button size="sm" variant="secondary" disabled>
            Withdraw
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => change(Operation.REMOVE_LIQUIDITY_CLOSE)}
          >
            Withdraw
          </Button>
        )}
      </Box>
    </>
  )
}

const OrderOptions: React.FC = () => {
  const [tab, setTab] = useState(0)
  const { item } = useItem()
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
              <Box row justifyContent="flex-start" alignItems="center">
                <Label text={'Long Balance'} />
                <Spacer />
                <StyledBalance>
                  {positions.loading ? (
                    <Loader size="sm" />
                  ) : !option.long ? (
                    '0.00'
                  ) : (
                    formatEtherBalance(option.long)
                  )}
                </StyledBalance>
              </Box>
              <Box row justifyContent="space-between" alignItems="center">
                <Button full size="sm" onClick={() => change(Operation.LONG)}>
                  Buy
                </Button>
                <Spacer />
                <Button
                  full
                  disabled={!positions.loading ? false : true}
                  size="sm"
                  variant="secondary"
                  onClick={() => change(Operation.CLOSE_LONG)}
                >
                  Sell
                </Button>
              </Box>
            </StyledColumn>
          </TabPanel>
          <TabPanel>
            <StyledColumn>
              <Box row justifyContent="flex-start" alignItems="center">
                <Label text={'Short Balance'} />
                <Spacer />
                <StyledBalance>
                  {positions.loading ? (
                    <Loader size="sm" />
                  ) : !option.short ? (
                    '0.00'
                  ) : (
                    formatEtherBalance(option.short)
                  )}
                </StyledBalance>
              </Box>
              <Box row justifyContent="space-between" alignItems="center">
                <Button full size="sm" onClick={() => change(Operation.SHORT)}>
                  Buy
                </Button>
                <Spacer />
                <Button
                  full
                  disabled={!positions.loading ? false : true}
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
const Units = styled.span`
  opacity: 0.66;
  font-size: 16px;
  padding-left: 0.5em;
`

const StyledT = styled.span`
  border-width: 0 0 1px 0;
  border-style: solid;
  border-color: ${(props) => props.theme.color.grey[600]};
  padding: 3px 0 6px 0;
`
const StyledR = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 160px;
`

const StyledTabs = styled(Tabs)`
  width: 100%;
`
const Reverse = styled.div`
  margin-top: -1.1em;
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
  color: ${(props) => props.theme.color.white};
  font-weight: ${(props) => (props.active ? 600 : 500)};
  padding: 1em;
  border-radius: 0.3em 0.3em 0 0;
  border-width: 1px 1px 0 1px;
  border-style: solid;
  border-color: ${(props) => props.theme.color.grey[600]};
  width: 25%;
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
  padding: 1em 2em 2em 2em;
  border-color: ${(props) => props.theme.color.grey[600]};
  background: ${(props) => props.theme.color.black};
`
const StyledBalance = styled.h5`
  color: ${(props) => props.theme.color.white};
`

export default OrderOptions
