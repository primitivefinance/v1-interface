import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import Card from 'components/Card'
import CardContent from 'components/CardContent'
import CardTitle from 'components/CardTitle'
import Button from 'components/Button'
import Input from 'components/Input'
import Spacer from 'components/Spacer'

import { useWeb3React } from '@web3-react/core'
import useOrder from '../../../../hooks/useOrders'

import Assets from '../../../../contexts/Options/assets.json'
import Expiries from '../../../../contexts/Options/expiries_simple.json'

interface CreateCardProps {}

const CreateCard: React.FC<CreateCardProps> = (props) => {
  const { library, chainId } = useWeb3React()
  const { createOption } = useOrder()
  const assets = Object.keys(Assets)
  const expiries = Expiries.timestamps
  const [expiry, setExpiry] = useState(expiries[0])
  const [asset, setAsset] = useState(Assets[assets[0]][chainId || 1])
  const [strike, setStrike] = useState(0)
  const [isCallType, setIsCallType] = useState(true)

  useEffect(() => {}, [chainId, library])
  useEffect(() => {}, [asset, expiry, strike, isCallType])

  const handleChange = (event) => {
    event.preventDefault()
    let name = event.target.name
    let val = event.target.value
    switch (name) {
      case 'strike':
        console.log('setting strike')
        setStrike(Number(val))
        break
      case 'expiry':
        setExpiry(val)
        break
      case 'asset':
        setAsset(val)
        break
      default:
        break
    }
  }

  const handleSubmit = () => {
    console.log('Submitting: ', { asset, expiry, strike, isCallType })
    createOption(library, asset, isCallType, expiry, strike)
  }

  const onToggle = () => {
    setIsCallType(!isCallType)
  }

  const getSimpleDate = (timestamp) => {
    let date = new Date(timestamp * 1000)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
  }

  return (
    <Card>
      <CardTitle>Create Option</CardTitle>
      <CardContent>
        <StyledFilter>
          <StyledLabel>Type</StyledLabel>
          <Spacer />
          <Button
            onClick={onToggle}
            text={'Call'}
            variant={!isCallType ? 'tertiary' : 'default'}
          />
          <Button
            onClick={onToggle}
            text={'Put'}
            variant={!isCallType ? 'default' : 'tertiary'}
          />
        </StyledFilter>
        <Spacer />
        <StyledLabel>
          Underlying Asset
          <StyledSelect
            autoFocus
            value={asset}
            onChange={handleChange}
            name="asset"
          >
            {assets.map((selection, i) => {
              return (
                <StyledOption key={i} value={Assets[selection][chainId]}>
                  {selection}
                </StyledOption>
              )
            })}
          </StyledSelect>
        </StyledLabel>
        <Spacer />
        <StyledLabel>
          Expiry
          <StyledSelect value={expiry} onChange={handleChange} name="expiry">
            {expiries.map((selection, i) => {
              return (
                <StyledOption key={i} value={selection}>
                  {getSimpleDate(selection)}
                </StyledOption>
              )
            })}
          </StyledSelect>
        </StyledLabel>
        <Spacer />
        <StyledLabel>
          Strike Price
          <Input placeholder="0.00" onChange={handleChange}></Input>
        </StyledLabel>
        <Spacer />
        <Button disabled onClick={handleSubmit} text="Create Option" />
      </CardContent>
    </Card>
  )
}

const StyledSelect = styled.select`
  align-items: center;
  display: flex;
  border-radius: ${(props) => props.theme.borderRadius}px;
  border: none;
  background: ${(props) => props.theme.color.black};
  color: ${(props) => props.theme.color.grey[400]};
  padding: ${(props) => props.theme.spacing[3]}px;
  width: calc(
    (100vw - ${(props) => props.theme.contentWidth}px) / 4 +
      ${(props) => props.theme.contentWidth * (1 / 8)}px
  );
  margin-right: ${(props) => props.theme.spacing[7]}px;
`
const StyledOption = styled.option``

const StyledFilter = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  width: 100%;
`
const StyledLabel = styled.label``

export default CreateCard
