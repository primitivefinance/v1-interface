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
  const underlyingToken: Token = item.entity.underlying
  const lpPair = useReserves(underlyingToken, item.entity.redeem).data
  const change = (t: Operation) => {
    if (t === Operation.REMOVE_LIQUIDITY_CLOSE) {
      updateItem(item, t, lpPair)
    } else {
      updateItem(item, t)
    }
  }
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

const ManageOptions: React.FC = () => {
  const [tab, setTab] = useState(0)
  const { item, orderType, approved } = useItem()
  const updateItem = useUpdateItem()
  const positions = usePositions()
  const [option, setOption] = useState({ long: null, short: null, lp: null })
  useEffect(() => {
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
  }, [setOption, positions, item])
  const change = (t: Operation) => {
    updateItem(item, t)
  }

  return (
    <>
      <Box row alignItems="flex-start" justifyContent="center">
        <StyledTabs selectedIndex={tab} onSelect={(index) => setTab(index)}>
          <Spacer />
          <TabPanel>
            <StyledColumn>
              <Spacer />
              <Box row justifyContent="space-between" alignItems="center">
                <Button full size="sm" onClick={() => change(Operation.MINT)}>
                  Mint
                </Button>
                <Spacer size="sm" />
                <Button
                  full
                  disabled={false}
                  size="sm"
                  variant="secondary"
                  onClick={() => change(Operation.EXERCISE)}
                >
                  Exercise
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
                  onClick={() => change(Operation.REDEEM)}
                >
                  Redeem
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
                  onClick={() => change(Operation.CLOSE)}
                >
                  Close
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

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -2.5em;
  padding: 0em 1em 1em 1em;
`

export default ManageOptions
