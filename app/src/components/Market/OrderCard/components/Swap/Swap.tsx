import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import ethers from 'ethers'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LineItem from '@/components/LineItem'
import Loader from '@/components/Loader'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
import Tooltip from '@/components/Tooltip'
import WarningLabel from '@/components/WarningLabel'
import { Operation, UNISWAP_CONNECTOR } from '@/constants/index'

import useGuardCap from '@/hooks/useGuardCap'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'

import useApprove from '@/hooks/useApprove'
import useTokenAllowance, {
  useGetTokenAllowance,
} from '@/hooks/useTokenAllowance'
import useTokenBalance from '@/hooks/useTokenBalance'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'

import { UNISWAP_ROUTER02_V2 } from '@/lib/constants'
import { useAllTransactions } from '@/state/transactions/hooks'

import {
  useItem,
  useUpdateItem,
  useHandleSubmitOrder,
  useRemoveItem,
} from '@/state/order/hooks'
import { useAddNotif } from '@/state/notifs/hooks'

import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount, JSBI } from '@uniswap/sdk'

import formatEtherBalance from '@/utils/formatEtherBalance'

const Swap: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()
  // toggle for advanced info
  const [advanced, setAdvanced] = useState(false)
  const [checking, setChecking] = useState(true)
  // approval state
  const { item, orderType, loading, approved, lpApproved } = useItem()
  const txs = useAllTransactions()

  // inputs for user quantity
  const [inputs, setInputs] = useState({
    primary: '',
    secondary: '',
  })
  // web3
  const { library, chainId } = useWeb3React()
  const addNotif = useAddNotif()
  // guard cap
  const guardCap = useGuardCap(item.asset, orderType)

  // pair and option entities
  const entity = item.entity
  const underlyingToken: Token = new Token(
    entity.chainId,
    entity.assetAddresses[0],
    18,
    entity.isPut ? 'DAI' : item.asset.toUpperCase()
  )

  let title = { text: '', tip: '' }
  let tokenAddress: string
  let balance: Token
  switch (orderType) {
    case Operation.LONG:
      title = {
        text: 'Buy Long Tokens',
        tip: 'Purchase and hold option tokens.',
      }
      tokenAddress = underlyingToken.address
      balance = underlyingToken
      break
    case Operation.SHORT:
      title = {
        text: 'Buy Short Tokens',
        tip: 'Purchase tokenized, written covered options.',
      }
      tokenAddress = underlyingToken.address
      balance = underlyingToken
      break
    case Operation.WRITE:
      title = {
        text: 'Write Options',
        tip:
          'Underwrite long option tokens with an underlying token deposit, and sell them for premiums denominated in underlying tokens.',
      }
      tokenAddress = item.entity.address //underlyingToken.address
      balance = underlyingToken
      break
    case Operation.CLOSE_LONG:
      title = {
        text: 'Close Long Position',
        tip: `Sell option tokens for ${item.asset.toUpperCase()}.`,
      }
      tokenAddress = entity.address
      balance = new Token(entity.chainId, tokenAddress, 18, 'LONG')
      break
    case Operation.CLOSE_SHORT:
      title = {
        text: 'Close Short Position',
        tip: `Sell short option tokens for ${item.asset.toUpperCase()}.`,
      }
      tokenAddress = entity.assetAddresses[2]
      balance = new Token(entity.chainId, tokenAddress, 18, 'SHORT')
      break
    default:
      break
  }
  const tokenBalance = useTokenBalance(tokenAddress)
  const tokenAmount: TokenAmount = new TokenAmount(
    balance,
    parseEther(tokenBalance).toString()
  )
  const spender =
    orderType === Operation.CLOSE_SHORT || orderType === Operation.SHORT
      ? UNISWAP_ROUTER02_V2
      : UNISWAP_CONNECTOR[chainId]
  const underlyingTokenBalance = useTokenBalance(underlyingToken.address)
  const { onApprove } = useApprove(tokenAddress, spender)

  const handleInputChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setInputs({
        ...inputs,
        [e.currentTarget.name]: e.currentTarget.value,
      })
    },
    [setInputs, inputs]
  )

  // FIX
  const handleSetMax = () => {
    const max =
      ((+underlyingTokenBalance / (+item.premium + Number.EPSILON)) * 100) / 100

    setInputs({
      ...inputs,
      primary: parseFloat(tokenBalance).toFixed(10).toString(),
    })
  }

  const handleSubmitClick = useCallback(() => {
    const imp = BigInt(
      (parseFloat(inputs.primary) * 1000000000000000000).toString()
    )
    console.log(imp.toString())
    console.log(
      BigInt(parseFloat(tokenBalance) * 1000000000000000000).toString()
    )
    submitOrder(
      library,
      item?.address,
      imp,
      orderType,
      BigInt(inputs.secondary)
    )
    removeItem()
  }, [submitOrder, removeItem, item, library, inputs, orderType])

  const premiumMulSize = (premium, size) => {
    const premiumWei = BigNumber.from(premium)
    if (size === '') return '0'
    const sizeWei = parseEther(parseFloat(size).toString())
    const debit = formatEther(
      premiumWei.mul(sizeWei).div(parseEther('1')).toString()
    )
    return debit
  }

  const calculateTotalCost = useCallback(() => {
    let debit = '0'
    let credit = '0'
    let short = '0'
    let size = inputs.primary === '' ? '0' : inputs.primary
    const base = item.entity.base.quantity.toString()
    const quote = item.entity.quote.quantity.toString()
    size = item.entity.isCall
      ? size
      : formatEther(parseEther(size).mul(quote).div(base))

    // buy long
    if (item.premium) {
      debit = premiumMulSize(item.premium.toString(), size)
    }

    // sell long
    if (item.closePremium) {
      credit = premiumMulSize(item.closePremium.toString(), size)
    }

    // buy short && sell short
    if (item.shortPremium) {
      short = premiumMulSize(item.shortPremium.toString(), size)
    }
    return { debit, credit, short }
  }, [item, inputs])

  const isAboveGuardCap = useCallback(() => {
    const inputValue =
      inputs.primary !== ''
        ? parseEther(parseFloat(inputs.primary).toString())
        : parseEther('0')
    return BigNumber.from(inputValue).gt(guardCap) && chainId === 1
  }, [inputs, guardCap])

  const handleApproval = useCallback(() => {
    onApprove()
      .then()
      .catch((error) => {
        addNotif(0, `Approving ${item.asset.toUpperCase()}`, error.message, '')
      })
  }, [inputs, onApprove])

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
      {orderType === Operation.SHORT || orderType === Operation.CLOSE_SHORT ? (
        <LineItem
          label="Short Premium"
          data={formatEther(item.shortPremium)}
          units={entity.isPut ? 'DAI' : item.asset}
        />
      ) : orderType === Operation.WRITE ||
        orderType === Operation.CLOSE_LONG ? (
        <LineItem
          label="Option Premium"
          data={formatEther(item.closePremium)}
          units={entity.isPut ? 'DAI' : item.asset}
        />
      ) : (
        <LineItem
          label="Option Premium"
          data={formatEther(item.premium)}
          units={entity.isPut ? 'DAI' : item.asset}
        />
      )}
      <Spacer size="sm" />
      <PriceInput
        title="Quantity"
        name="primary"
        onChange={handleInputChange}
        quantity={inputs.primary}
        onClick={handleSetMax}
        balance={tokenAmount}
        valid={parseEther(underlyingTokenBalance).gt(
          parseEther(calculateTotalCost().debit)
        )}
      />
      <Spacer size="sm" />
      {orderType === Operation.LONG ? (
        <>
          <LineItem
            label={'Total Debit'}
            data={calculateTotalCost().debit}
            units={`- ${entity.isPut ? 'DAI' : item.asset.toUpperCase()}`}
          />
        </>
      ) : orderType === Operation.WRITE ||
        orderType === Operation.CLOSE_LONG ? (
        <>
          <LineItem
            label={'Total Credit'}
            data={calculateTotalCost().credit}
            units={`+ ${entity.isPut ? 'DAI' : item.asset.toUpperCase()}`}
          />
        </>
      ) : orderType === Operation.SHORT ||
        orderType === Operation.CLOSE_SHORT ? (
        <>
          <LineItem
            label={`Total ${
              orderType === Operation.SHORT ? 'Debit' : 'Credit'
            }`}
            data={calculateTotalCost().short}
            units={`${orderType === Operation.SHORT ? '-' : '+'} ${
              entity.isPut ? 'DAI' : item.asset.toUpperCase()
            }`}
          />
        </>
      ) : (
        <></>
      )}
      <IconButton
        text="Advanced"
        variant="transparent"
        onClick={() => setAdvanced(!advanced)}
      >
        {advanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
      <Spacer size="sm" />

      {advanced ? ( // FIX
        <>
          <LineItem label="Price Impact" data={``} />
          <Spacer />
        </>
      ) : (
        <> </>
      )}

      {isAboveGuardCap() ? (
        <>
          <div style={{ marginTop: '-.5em' }} />
          <WarningLabel>
            This amount of underlying tokens is above our guardrail cap of
            $10,000
          </WarningLabel>
          <Spacer size="sm" />
        </>
      ) : (
        <></>
      )}

      <Box row justifyContent="flex-start">
        {loading ? (
          <div style={{ width: '100%' }}>
            <Box column alignItems="center" justifyContent="center">
              <Loader />
            </Box>
          </div>
        ) : (
          <>
            {approved ? (
              <> </>
            ) : (
              <>
                <Button
                  disabled={loading}
                  full
                  size="sm"
                  onClick={handleApproval}
                  isLoading={loading}
                  text="Approve"
                />
              </>
            )}
            <Button
              disabled={
                !approved || !inputs.primary || loading || isAboveGuardCap()
              }
              full
              size="sm"
              onClick={handleSubmitClick}
              isLoading={loading}
              text="Confirm Transaction"
            />
          </>
        )}
      </Box>
    </>
  )
}
const StyledTitle = styled.h5`
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px;
`
export default Swap
