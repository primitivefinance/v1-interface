import { MaxUint256 } from '@ethersproject/constants'
import { BigNumberish } from 'ethers'

import { TransactionResponse } from '@ethersproject/providers'
import { Trade, TokenAmount, CurrencyAmount, ETHER } from '@uniswap/sdk'
import { useCallback, useMemo } from 'react'
import { useTokenAllowance } from '@/hooks/data/useTokenAllowance'
import useTransactions, { useHasPendingApproval } from '@/hooks/transactions'
import {
  calculateGasMargin,
  computeSlippageAdjustedAmounts,
} from '@/utils/index'
import { useWeb3React } from '@web3-react/core'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: BigNumberish,
  tokenAddress?: string,
  spender?: string
): [ApprovalState, () => Promise<void>] {
  const { account } = useWeb3React()
  const currentAllowance = useTokenAllowance(tokenAddress, spender)
  const { addTransaction } = useTransactions()
  const pendingApproval = useHasPendingApproval(tokenAddress, spender)

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency === ETHER) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance < amountToApprove
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (!tokenAddress) {
      console.error('no token')
      return
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas
      .approve(spender, MaxUint256)
      .catch(() => {
        // general fallback for tokens who restrict approval amounts
        useExact = true
        return tokenContract.estimateGas.approve(
          spender,
          amountToApprove.raw.toString()
        )
      })

    return tokenContract
      .approve(
        spender,
        useExact ? amountToApprove.raw.toString() : MaxUint256,
        {
          gasLimit: calculateGasMargin(estimatedGas),
        }
      )
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve ' + amountToApprove.currency.symbol,
          approval: { tokenAddress: token.address, spender: spender },
        })
      })
      .catch((error: Error) => {
        console.debug('Failed to approve token', error)
        throw error
      })
  }, [approvalState, tokenAddress, amountToApprove, spender, addTransaction])

  return [approvalState, approve]
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromOrder(
  amount: BigNumberish,
  allowedSlippage = 0,
  address?: string
) {
  const amountToApprove = computeSlippageAdjustedAmounts(
    amount,
    allowedSlippage
  )

  return useApproveCallback(amountToApprove, address)
}
