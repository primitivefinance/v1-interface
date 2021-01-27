import React, { useState } from 'react'
import styled from 'styled-components'

import AddIcon from '@material-ui/icons/Add'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Spacer from '@/components/Spacer'
import Box from '@/components/Box'
import Loader from '@/components/Loader'

import { Operation } from '@/constants/index'

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

  const handleClick = () => {
    updateItem(option.attributes, Operation.LONG)
  }

  return (
    <StyledPosition onClick={handleClick}>
      <StyledPrice>
        <StyledExpiryContainer>
          <StyledExpiry>{utc.substr(4, 12)}</StyledExpiry>
          <StyledExpiry>Total Value</StyledExpiry>
        </StyledExpiryContainer>
        <StyledValuesContainer>
          <StyledValue>
            {numeral(option.attributes.entity.strikePrice).format(
              option.attributes.entity.strikePrice >= 1 ? '$0' : '$0.00'
            )}{' '}
            {option.attributes.entity.isCall ? 'Call' : 'Put'}
          </StyledValue>
          <Spacer size="sm" />
          <StyledValue>
            {numeral(
              formatEther(
                BigNumber.from(option.long ? option.long : 0)
                  .mul(option.attributes.market.spotClosePremium.raw.toString())
                  .div(parseEther('1'))
              )
            ).format('0.00')}{' '}
            {option.attributes.asset.toUpperCase()}
          </StyledValue>
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
      <StyledEmptyContent>
        <Spacer size="sm" />
        <StyledEmptyMessage>LOADING POSITIONS</StyledEmptyMessage>
        <StyledEmptyMessage>
          <Loader />
        </StyledEmptyMessage>
        <Spacer />
      </StyledEmptyContent>
    )
  }
  if (!positions.exists) {
    return (
      <Card border>
        <CardContent>
          <StyledEmptyContent>
            <Spacer size="sm" />
            <StyledEmptyIcon>
              <AddIcon />
            </StyledEmptyIcon>
            <StyledEmptyMessage>
              Add an option to open a position
            </StyledEmptyMessage>
            <Spacer size="sm" />
          </StyledEmptyContent>
        </CardContent>
      </Card>
    )
  }
  return (
    <div>
      <Card border>
        <Reverse />
        <CardTitle>
          <div onClick={() => setOpen(!open)}>
            <StyledBox row justifyContent="space-between" alignItems="center">
              <Title>{`Active ${item.item.asset.toUpperCase()} Positions`}</Title>
              <Spacer />
              {!open ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </StyledBox>
          </div>
        </CardTitle>
        <Reverse />
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

const Scroll = styled.div`
  overflow: scroll;
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
  padding-left: ${(props) => props.theme.spacing[4]}px;
  padding-right: ${(props) => props.theme.spacing[4]}px;
`

const StyledValuesContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  padding-left: ${(props) => props.theme.spacing[4]}px;
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
  letter-spacing: 0.5px;
`

const StyledExpiry = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 12px;
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
  box-shadow: 2px 2px 2px rgba(250, 250, 250, 0.1);
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
`

export default PositionsCard
