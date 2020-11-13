import React, { useState, useCallback } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LineItem from '@/components/LineItem'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
import Tooltip from '@/components/Tooltip'
import { Operation, UNISWAP_CONNECTOR } from '@/constants/index'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'

import useApprove from '@/hooks/useApprove'
import useTokenAllowance from '@/hooks/useTokenAllowance'
import useTokenBalance from '@/hooks/useTokenBalance'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { UNISWAP_ROUTER02_V2 } from '@/lib/constants'

import {
  useItem,
  useUpdateItem,
  useHandleSubmitOrder,
  useRemoveItem,
} from '@/state/order/hooks'

import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@uniswap/sdk'
import formatEtherBalance from '@/utils/formatEtherBalance'

const Swap: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()
  // toggle for advanced info
  const [advanced, setAdvanced] = useState(false)
  // state for pending txs
  const [submitting, setSubmit] = useState(false)
  // option entity in order
  const { item, orderType } = useItem()
  // inputs for user quantity
  const [inputs, setInputs] = useState({
    primary: '',
    secondary: '',
  })
  // web3
  const { library, chainId } = useWeb3React()

  // pair and option entities
  const entity = item.entity
  const underlyingToken: Token = new Token(
    entity.chainId,
    entity.assetAddresses[0],
    18,
    item.asset.toUpperCase()
  )

  let title = { text: '', tip: '' }
  let tokenAddress
  switch (orderType) {
    case Operation.LONG:
      title = { text: 'Buy Long Tokens', tip: '' }
      tokenAddress = underlyingToken.address
      break
    case Operation.SHORT:
      title = { text: 'Sell Short Tokens', tip: '' }
      tokenAddress = underlyingToken.address
      break
    case Operation.CLOSE_LONG:
      title = { text: 'Close Long Position', tip: '' }
      tokenAddress = entity.address
      break
    case Operation.CLOSE_SHORT:
      title = { text: 'Close Short Position', tip: '' }
      tokenAddress = entity.assetAddresses[2]
      break
    default:
      break
  }

  let spender =
    Operation.CLOSE_SHORT || Operation.CLOSE_LONG
      ? UNISWAP_ROUTER02_V2
      : UNISWAP_CONNECTOR[chainId]

  const tokenBalance = useTokenBalance(tokenAddress)
  const tokenAllowance = useTokenAllowance(tokenAddress, spender)
  // approve
  const { onApprove } = useApprove(tokenAddress, spender)

  const underlyingTokenBalance = useTokenBalance(underlyingToken.address)

  const handleInputChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setInputs({ ...inputs, [e.currentTarget.name]: e.currentTarget.value })
    },
    [setInputs, inputs]
  )

  // FIX
  const handleSetMax = () => {
    const max = Math.round(
      ((+underlyingTokenBalance / (+item.premium + Number.EPSILON)) * 100) / 100
    )
    setInputs({ ...inputs, primary: max.toString() })
  }

  const handleSubmitClick = useCallback(() => {
    setSubmit(true)
    submitOrder(
      library,
      item?.address,
      Number(inputs.primary),
      orderType,
      Number(inputs.secondary)
    )
    removeItem()
  }, [submitOrder, removeItem, item, library, inputs, orderType])

  const calculateTotalDebit = useCallback(() => {
    let debit = '0'
    if (item.premium) {
      const premium = BigNumber.from(item.premium.toString())
      const size = inputs.primary === '' ? '0' : inputs.primary
      debit = formatEther(premium.mul(size).toString())
    }
    return debit
  }, [item, inputs])

  return (
    <>
      <Box row justifyContent="flex-start">
        <IconButton
          variant="tertiary"
          size="sm"
          onClick={() => updateItem(item, Operation.NONE)}
        >
          <ArrowBackIcon />
        </IconButton>
        <Spacer size="sm" />
        <StyledTitle>
          <Tooltip text={title.tip}>{title.text}</Tooltip>
        </StyledTitle>
      </Box>

      <Spacer />
      <LineItem
        label="Option Premium"
        data={formatEtherBalance(item.premium).toString()}
        units={item.asset}
      />
      <Spacer />
      <PriceInput
        title="Quantity"
        name="primary"
        onChange={handleInputChange}
        quantity={inputs.primary}
        onClick={handleSetMax}
      />

      <Spacer />
      <LineItem
        label={`Total ${
          Operation.LONG || Operation.SHORT
            ? 'Debit'
            : Operation.CLOSE_LONG || Operation.CLOSE_SHORT
            ? 'Credit'
            : 'Cost'
        }`}
        data={calculateTotalDebit().toString()}
        units={`${
          Operation.LONG || Operation.SHORT
            ? '-'
            : Operation.CLOSE_LONG || Operation.CLOSE_SHORT
            ? '+'
            : '-'
        } ${item.asset.toUpperCase()}`}
      />
      <Spacer />
      <IconButton
        text="Advanced"
        variant="transparent"
        onClick={() => setAdvanced(!advanced)}
      >
        <ExpandMoreIcon />
      </IconButton>
      <Spacer />

      {advanced ? ( // FIX
        <>
          <Spacer size="sm" />
          <LineItem label="Price Impact" data={``} />
          <Spacer />
        </>
      ) : (
        <> </>
      )}
      {BigNumber.from(
        +tokenAllowance === 0 ? '0' : tokenAllowance.toString()
      ).gt(inputs.primary.toString() || '0') ? (
        <Button
          disabled={!inputs || submitting}
          full
          size="sm"
          onClick={handleSubmitClick}
          isLoading={submitting}
          text="Review Transaction"
        />
      ) : (
        <>
          {' '}
          <Button
            disabled={!tokenAllowance || submitting}
            full
            size="sm"
            onClick={onApprove}
            isLoading={submitting}
            text="Approve"
          />
        </>
      )}
    </>
  )
}

const StyledText = styled.h5`
  color: ${(props) => props.theme.color.white};
  display: flex;
  font-size: 16px;
  font-weight: 500;
  margin: ${(props) => props.theme.spacing[2]}px;
`
const StyledTitle = styled.h5`
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px;
`
const StyledSubtitle = styled.h5`
  color: ${(props) => props.theme.color.white};
  font-size: 16px;
  font-weight: 500;
  margin: ${(props) => props.theme.spacing[2]}px;
`

export default Swap
