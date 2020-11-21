import React from 'react'
import styled from 'styled-components'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Label from '@/components/Label'
import Spacer from '@/components/Spacer'
import { BigNumberish } from 'ethers'

import { TokenAmount } from '@uniswap/sdk'

import formatEtherBalance from '@/utils/formatEtherBalance'

export interface PriceInputProps {
  name?: string
  title: string
  quantity: BigNumberish | number
  onChange: (e: React.FormEvent<HTMLInputElement>) => void
  onClick: () => void
  startAdornment?: React.ReactNode
  balance?: TokenAmount
  valid?: boolean
}

const PriceInput: React.FC<PriceInputProps> = ({
  name,
  title,
  quantity,
  onChange,
  onClick,
  startAdornment,
  balance,
  valid,
}) => {
  return (
    <>
      <Label text={title} />
      <Spacer size="sm" />
      <Input
        name={name}
        placeholder={'0.00'}
        startAdornment={!startAdornment ? startAdornment : null}
        onChange={onChange}
        value={`${quantity ? quantity.toString() : ''}`}
        endAdornment={
          <Button size="sm" variant="secondary" text="Max" onClick={onClick} />
        }
        valid={valid}
      />
      <Spacer size="sm" />
      {balance ? (
        <ContainerSpan>
          <LeftSpan>
            <OpacitySpan>
              <Label text={'balance'} />
            </OpacitySpan>
          </LeftSpan>
          <RightSpan>
            {formatEtherBalance(balance.raw.toString())}{' '}
            <OpacitySpan>{balance.token.symbol.toUpperCase()}</OpacitySpan>{' '}
          </RightSpan>
        </ContainerSpan>
      ) : (
        <> </>
      )}
    </>
  )
}

const ContainerSpan = styled.span`
  display: flex;
`

const LeftSpan = styled.span`
  align-self: flex-start;
  flex: 1;
`

const RightSpan = styled.span`
  align-self: flex-end;
`

const OpacitySpan = styled.span`
  opacity: 0.66;
`
export default PriceInput
