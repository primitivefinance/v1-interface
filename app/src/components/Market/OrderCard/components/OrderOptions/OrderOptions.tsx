import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

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
        {balance ? (
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
  const [tab, setTab] = useState(0)
  const { item } = useItem()
  const updateItem = useUpdateItem()
  const positions = usePositions()
  const [option, setOption] = useState({ long: null, short: null, lp: null })
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
    updateItem(item, t)
  }

  return (
    <Box row alignItems="flex-start" justifyContent="center">
      <StyledTabs selectedIndex={tab} onSelect={(index) => setTab(index)}>
        <Box row justifyContent="flex-start">
          <StyledTabList>
            <StyledTab active={tab === 0}>Long</StyledTab>
            <Spacer />
            <StyledTab active={tab === 1}>Short</StyledTab>
            <Spacer />
            <StyledTab active={tab === 2}>Pool</StyledTab>
          </StyledTabList>
        </Box>
        <Spacer />
        <TabPanel>
          <StyledColumn>
            <Box row justifyContent="flex-start" alignItems="center">
              <Label text={'Balance'} />
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
            <Button full size="sm" onClick={() => change(Operation.LONG)}>
              Buy
            </Button>
            <Spacer size="sm" />
            <Button
              full
              disabled={!positions.loading ? false : true}
              size="sm"
              variant="secondary"
              onClick={() => change(Operation.CLOSE_LONG)}
            >
              Sell
            </Button>
          </StyledColumn>
        </TabPanel>
        <TabPanel>
          <StyledColumn>
            <Box row justifyContent="flex-start" alignItems="center">
              <Label text={'Balance'} />
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
            <Button full size="sm" onClick={() => change(Operation.SHORT)}>
              Buy
            </Button>
            <Spacer size="sm" />
            <Button
              full
              disabled={!positions.loading ? false : true}
              size="sm"
              variant="secondary"
              onClick={() => change(Operation.CLOSE_SHORT)}
            >
              Sell
            </Button>
          </StyledColumn>
        </TabPanel>
        <TabPanel>
          <LPOptions balance={option.lp ? option.lp : null} />
        </TabPanel>
      </StyledTabs>
    </Box>
  )
}
const StyledTabs = styled(Tabs)`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const StyledTabList = styled(TabList)`
  background-color: ${(props) => props.theme.color.grey[700]};
  border-radius: ${(props) => props.theme.borderRadius}px;
  border-bottom: 2px solid black;
  display: flex;
  flex-direction: row;
  margin: 0px;
  padding-left: 1em;
  width: 100%;
`

interface TabProps {
  active?: boolean
}

const StyledTab = styled(Tab)<TabProps>`
  background-color: ${(props) =>
    props.active ? props.theme.color.grey[500] : 'transparent'};
  color: ${(props) => props.theme.color.white};
  font-weight: ${(props) => (props.active ? 600 : 500)};
  list-style: none;
  margin-right: ${(props) => props.theme.spacing[2]}px;
`

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
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
