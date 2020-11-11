import { MaxUint256 } from '@ethersproject/constants'
import { BigNumberish } from 'ethers'

import { TransactionResponse } from '@ethersproject/providers'
import { Trade, TokenAmount, CurrencyAmount, ETHER } from '@uniswap/sdk'
import { useCallback, useMemo, useState } from 'react'
import { useTokenAllowance } from '@/hooks/data/useTokenAllowance'
import { getAllowance } from '@/lib/erc20'

import { Operation } from '@/constants/index'

import useTransactions, { useHasPendingApproval } from '@/hooks/transactions'

import { useWeb3React } from '@web3-react/core'

export enum ApprovalProgress {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

interface Approval {
  progress: ApprovalProgress
  tokenAddress: string
  amountToApprove: BigNumberish
}

export interface ApprovalQueue {
  orderType: Operation
  approvals: [Approval]
  isComplete: boolean
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export const useApprovalQueue = () => {
  const { account, library } = useWeb3React()
  const [queue, setQueue] = useState({
    orderType: Operation.NONE,
    approvals: [],
    isComplete: false,
  })

  // check the current approval status
  const checkQueue = useCallback(async (): Promise<void> => {
    const promises = queue.approvals.map(async (approval) => {
      if (!approval.isComplete) {
        const allowance = await getAllowance(
          library,
          approval.tokenAddress,
          account,
          approval.spender
        )
        if (allowance >= approval.amountToApprove) {
          approve(approval.tokenAddress, approval.spender).then(() => {
            console.log('APPROVAL CONFIRMED  ->', approval.Token)
          })
        } else {
          console.log('Approval is not confirmed!')
        }
      } else {
        console.log('Approval is complete? -> ', approval.isComplete)
      }
    })
    Promise.all(promises).then(() => {
      console.log('Approvals check complete')
      return
    })
  }, [queue, setQueue])

  const createQueue = (orderType: Operation, approvals: [Approval]) => {
    setQueue({
      orderType: orderType,
      approvals: approvals,
      isComplete: false,
    })
    return
  }

  const addToQueue = useCallback(
    (app: Approval) => {
      if (queue.approvals.length > 0) {
        setQueue({
          orderType: queue.orderType,
          approvals: queue.approvals.push(app),
          isComplete: false,
        })
      }
    },
    [queue, setQueue]
  )
  const approve = useCallback(
    async (tokenAddress: string | undefined, spender: string | undefined) => {
      if (!queue.approvals) return
      if (!tokenAddress) {
        console.error('no token')
        return
      }
      const temp = queue?.approvals
      const approval = queue?.approvals.filter(
        (app) => app.tokenAddress === tokenAddress
      )
      const index = queue?.approvals.indexOf(approval)
      if (!approval) return

      if (approval?.progress !== ApprovalProgress.NOT_APPROVED) {
        console.error('approve was called unnecessarily')
        return
      }

      if (!approval?.amountToApprove) {
        console.error('missing amount to approve')
        return
      }

      if (!approval?.spender) {
        console.error('no spender')
        return
      }
      const allowance = await getAllowance(
        library,
        tokenAddress,
        account,
        spender
      )
      if (allowance >= approval?.amountToApprove) {
        temp[index].progress = ApprovalProgress.APPROVED
        const complete =
          temp.filter((app) => app.progress !== ApprovalProgress.APPROVED)
            .length > 0

        setQueue({
          orderType: queue.orderType,
          approvals: temp,
          isComplete: complete,
        })
        return
      } else {
        setQueue({
          orderType: queue.orderType,
          approvals: temp,
          isComplete: false,
        })
        return
      }
    },
    [queue, setQueue]
  )
  return { queue, createQueue, checkQueue, addToQueue, approve }
}
