import React from 'react'
import styled from 'styled-components'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Label from '@/components/Label'
import Spacer from '@/components/Spacer'
import Box from '@/components/Box'
import { BigNumberish } from 'ethers'
import Tooltip from '@/components/Tooltip'

import { TokenAmount, JSBI } from '@uniswap/sdk'

import formatEtherBalance from '@/utils/formatEtherBalance'

export interface PriceInputProps {
  name?: string
  title: string
  quantity: string | undefined
  onChange: (input: string) => void
  onClick: () => void
  startAdornment?: React.ReactNode
  balance?: TokenAmount
  valid?: boolean
  tip?: string
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
  tip,
}) => {
  return (
    <StyledContainer>
      {balance ? (
        <Box row justifyContent="space-between">
          {tip ? (
            <Tooltip text={tip}>
              <Label text={title} />
            </Tooltip>
          ) : (
            <Label text={title} />
          )}

          <ContainerSpan>
            <LeftSpan>
              <OpacitySpan>Max</OpacitySpan>
            </LeftSpan>{' '}
            <Spacer size="sm" />
            <RightSpan onClick={onClick}>
              {formatEtherBalance(balance.raw.toString())}{' '}
              <OpacitySpan>
                {/** second conditional is a testnet hotfix */}
                {balance.token.symbol.toUpperCase() === 'RDM'
                  ? 'SHORT'
                  : balance.token.symbol.toUpperCase() === 'DAI STABLECOIN'
                  ? 'DAI'
                  : balance.token.symbol.toUpperCase()}
              </OpacitySpan>
            </RightSpan>
          </ContainerSpan>
        </Box>
      ) : (
        <>
          <Label text={title} />{' '}
        </>
      )}

      <Spacer size="sm" />
      <Input
        name={name}
        placeholder={'0.00'}
        startAdornment={!startAdornment ? startAdornment : null}
        onChange={onChange}
        value={quantity ? quantity : ''}
        endAdornment={
          <Button size="sm" variant="secondary" text="Max" onClick={onClick} />
        }
        valid={valid}
      />
    </StyledContainer>
  )
}

const ContainerSpan = styled.span`
  display: flex;
  &:hover {
    cursor: pointer;
  }
`

const LeftSpan = styled.span`
  align-self: flex-start;
  flex: 1;
`

const RightSpan = styled.span`
  align-self: flex-end;
  &:hover {
    opacity: 0.55;
  }
`

const OpacitySpan = styled.span`
  opacity: 0.66;
`

const StyledContainer = styled.div`
  min-width: 100% !important;
  display: flex !important;
  flex-direction: column;
  position: static !important;
`
export default PriceInput
