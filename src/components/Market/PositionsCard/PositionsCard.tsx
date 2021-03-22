import React, { useState, useCallback } from 'react'
import styled from 'styled-components'

import AddIcon from '@material-ui/icons/Add'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Separator from '@/components/Separator'
import LineItem from '@/components/LineItem'
import Spacer from '@/components/Spacer'
import Box from '@/components/Box'
import Loader from '@/components/Loader'

import { Operation } from '@primitivefi/sdk'

import { usePositions } from '@/state/positions/hooks'
import { useUpdateItem, useItem } from '@/state/order/hooks'

import { BigNumber } from 'ethers'
import { formatEther, parseEther } from 'ethers/lib/utils'
import formatExpiry from '@/utils/formatExpiry'
import numeral from 'numeral'
export interface TokenProps {
  option: any // replace with option type
}

const Position: React.FC<TokenProps> = ({ option }) => {
  const updateItem = useUpdateItem()
  const { utc } = formatExpiry(option.attributes.entity.expiryValue)
  const isPut = option.attributes.entity.isPut
  const entity = option.attributes.entity

  const handleClick = () => {
    updateItem(option.attributes, Operation.LONG)
  }

  const getScaledBalances = useCallback(() => {
    let long = '0'
    let short = '0'
    let balances = { long: long, redeem: short }
    const hasLong = BigNumber.from(option.long ? option.long : 0).gt(0)
    const hasShort = BigNumber.from(option.redeem ? option.redeem : 0).gt(0)
    if (hasLong) {
      long = formatEther(
        BigNumber.from(option.long ? option.long : 0)
          .mul(
            isPut
              ? entity.quoteValue.raw.toString()
              : entity.baseValue.raw.toString()
          )
          .div(entity.baseValue.raw.toString())
      )
    }
    if (hasShort) {
      short = formatEther(
        BigNumber.from(option.redeem ? option.redeem : 0)
          .mul(
            isPut
              ? entity.quoteValue.raw.toString()
              : entity.baseValue.raw.toString()
          )
          .div(entity.quoteValue.raw.toString())
      )
    }

    balances = { long: long, redeem: short }
    return balances
  }, [isPut, entity, option, option.long, option.redeem])

  if (getScaledBalances().redeem === '0' && getScaledBalances().long === '0')
    return null
  return (
    <StyledPosition onClick={handleClick}>
      <StyledPrice>
        <StyledExpiryContainer>
          <StyledExpiry>
            {numeral(option.attributes.entity.strikePrice).format(
              option.attributes.entity.strikePrice >= 10 ? '$0' : '$0.00'
            )}{' '}
            {isPut ? 'Put' : 'Call'} {utc.substr(4, 12)}
          </StyledExpiry>
        </StyledExpiryContainer>
        <StyledValuesContainer>
          {getScaledBalances().long !== '0' ? (
            <LineItem
              label={'long options'}
              data={
                getScaledBalances().long !== '0'
                  ? numeral(getScaledBalances().long).format('0.0000a')
                  : '--'
              }
            />
          ) : null}
          {getScaledBalances().redeem !== '0' ? (
            <LineItem
              label={`short options`}
              data={
                getScaledBalances().redeem !== '0'
                  ? numeral(getScaledBalances().redeem).format('0.0000a')
                  : '--'
              }
            />
          ) : null}
        </StyledValuesContainer>
      </StyledPrice>
    </StyledPosition>
  )
}

const PositionsCard: React.FC = () => {
  const item = useItem()
  const positions = usePositions()
  const [open, setOpen] = useState(true)

  if (item.item.asset) {
    return null
  }
  if (positions.loading) {
    return (
      <Card border>
        <StyledEmptyContent>
          <Spacer size="sm" />
          <StyledEmptyMessage>LOADING POSITIONS</StyledEmptyMessage>
          <StyledEmptyMessage>
            <Loader />
          </StyledEmptyMessage>
          <Spacer />
        </StyledEmptyContent>
      </Card>
    )
  }
  if (!positions.exists) {
    return (
      <Card border>
        <CardContent>
          <StyledEmptyContent>
            <Spacer />
            <StyledEmptyIcon>
              <AddIcon />
            </StyledEmptyIcon>
            <StyledEmptyMessage>Add an option to trade</StyledEmptyMessage>
            <Spacer size="sm" />
          </StyledEmptyContent>
        </CardContent>
      </Card>
    )
  }
  return (
    <div>
      <Card border>
        <Spacer size="sm" />
        <CardTitle>
          <div onClick={() => setOpen(!open)}>
            <StyledBox row justifyContent="space-between" alignItems="center">
              <Title>{`Active ${item.item.asset.toUpperCase()} Positions`}</Title>
              <Spacer />
              {!open ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </StyledBox>
          </div>
        </CardTitle>
        <Spacer size="sm" />
        <Spacer size="sm" />

        {!open ? (
          <Spacer size="sm" />
        ) : (
          <Scroll>
            <CardContent>
              {positions.options.map((pos, i) => {
                return <Position key={i} option={pos} />
              })}
            </CardContent>
          </Scroll>
        )}
      </Card>
    </div>
  )
}
const Units = styled.span`
  opacity: 0.66;
  font-size: 14px;
`

const Scroll = styled.div`
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 20em;
  border-radius: ${(props) => props.theme.borderRadius}px;
`

const StyledBox = styled(Box)`
  cursor: pointer;
  color: ${(props) => props.theme.color.white};
`

const Title = styled.h4`
  color: ${(props) => props.theme.color.white};
  min-width: 16em;
`
const Reverse = styled.div`
  margin-top: -1.1em;
`

const StyledExpiryContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: space-between;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 1px;
  border-bottom: 0px solid ${(props) => props.theme.color.grey[600]};
  height: 80%;
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[4]}px;
`

const StyledValuesContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-top: 5px;
  margin-bottom: 5px;
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[4]}px;
`

const StyledPrice = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
`
const StyledValue = styled.div`
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
  text-transform: uppercase;

  letter-spacing: 0.5px;
`
const StyledValues = styled.div`
  color: ${(props) => props.theme.color.white};
  font-size: 14px;
  letter-spacing: 0.5px;
`

const StyledExpiry = styled.span`
  color: ${(props) => props.theme.color.white};
  font-size: 14px;
  letter-spacing: 0.5px;
`

const StyledExpiryAlt = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 14px;
  letter-spacing: 0.5px;
`

const StyledPosition = styled.a`
  background-color: ${(props) => props.theme.color.black};
  border: 1.5px solid ${(props) => props.theme.color.grey[600]};
  color: ${(props) => props.theme.color.white} !important;
  border-radius: 0.5em;
  height: 5em;
  cursor: pointer;
  margin-bottom: 1em;
  margin-top: -0.2em;
  box-shadow: 2px 2px 2px rgba(250, 250, 250, 0.05);
  &:hover {
    border: 1.5px solid ${(props) => props.theme.color.grey[600]};
    box-shadow: 2px 2px 2px rgba(250, 250, 250, 0);
    background-color: ${(props) => props.theme.color.grey[600]};
  }
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
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  height: 44px;
  justify-content: center;
  width: 44px;
`

const StyledEmptyMessage = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
  margin-top: ${(props) => props.theme.spacing[3]}px;
  text-align: center;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 1px;
`

export default PositionsCard
