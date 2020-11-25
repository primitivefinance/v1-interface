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
import useTokenAllowance from '@/hooks/useTokenAllowance'
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
  useApproveItem,
} from '@/state/order/hooks'
import { useAddNotif } from '@/state/notifs/hooks'

import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@uniswap/sdk'

import formatEtherBalance from '@/utils/formatEtherBalance'

const Swap: React.FC = () => {
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()
  const approve = useApproveItem()
  // toggle for advanced info
  const [advanced, setAdvanced] = useState(false)
  const [checking, setChecking] = useState(true)
  // approval state
  const { item, orderType, approved, loading, lpApproved, checked } = useItem()
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
  const tokenAllowance = useTokenAllowance(tokenAddress, spender)
  const underlyingTokenBalance = useTokenBalance(underlyingToken.address)
  const { onApprove } = useApprove(tokenAddress, spender)

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
    updateItem(item, orderType, true)
    submitOrder(
      library,
      item?.address,
      Number(inputs.primary),
      orderType,
      Number(inputs.secondary)
    )
    removeItem()
  }, [submitOrder, removeItem, item, library, inputs, orderType])

  const calculateTotalCost = useCallback(() => {
    let debit = '0'
    if (item.premium) {
      const premiumWei = BigNumber.from(item.premium.toString())
      const size = inputs.primary === '' ? '0' : inputs.primary
      const sizeWei = parseEther(size)
      debit = formatEther(
        premiumWei.mul(sizeWei).div(parseEther('1')).toString()
      )
    }
    return debit
  }, [item, inputs])

  const isAboveGuardCap = useCallback(() => {
    const inputValue =
      inputs.primary !== '' ? parseEther(inputs.primary) : parseEther('0')
    return inputValue.gt(guardCap) && chainId === 1
  }, [inputs, guardCap])

  //APPROVALs
  useEffect(() => {
    console.log(tokenAllowance)
    const app: boolean = parseEther(tokenAllowance).gt(
      parseEther(inputs.primary || '0')
    )
    approve(app, lpApproved)
    setTimeout(() => {
      setChecking(false)
    }, 1000)
  }, [tokenAllowance, checked, setChecking])

  const handleApproval = useCallback(() => {
    onApprove()
      .then()
      .catch((error) => {
        addNotif(0, `Approving ${item.asset.toUpperCase()}`, error.message, '')
      })
  }, [inputs, tokenAllowance, onApprove])

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
      {orderType === Operation.SHORT ? (
        <LineItem
          label="Short Premium"
          data={formatEther(item.shortPremium)}
          units={entity.isPut ? 'DAI' : item.asset}
        />
      ) : orderType === Operation.CLOSE_LONG ? (
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
          parseEther(calculateTotalCost())
        )}
      />
      <Spacer size="sm" />
      <LineItem
        label={`Total ${
          orderType === Operation.LONG || orderType === Operation.SHORT
            ? 'Debit'
            : orderType === Operation.CLOSE_LONG ||
              orderType === Operation.CLOSE_SHORT
            ? 'Credit'
            : 'Debit'
        }`}
        data={Math.abs(parseInt(calculateTotalCost()))}
        units={`${
          orderType === Operation.LONG || orderType === Operation.SHORT
            ? '-'
            : orderType === Operation.CLOSE_LONG ||
              orderType === Operation.CLOSE_SHORT
            ? '+'
            : '-'
        } ${entity.isPut ? 'DAI' : item.asset.toUpperCase()}`}
      />
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
        {checking ? (
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
                  disabled={!tokenAllowance || loading}
                  full
                  size="sm"
                  onClick={handleApproval}
                  isLoading={loading}
                  text="Approve"
                />
              </>
            )}
            <Button
              disabled={!approved || !inputs || loading || isAboveGuardCap()}
              full
              size="sm"
              onClick={handleSubmitClick}
              isLoading={loading}
              text="Submit"
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
