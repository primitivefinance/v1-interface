import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Operation } from '@/constants/index'
import ethers from 'ethers'
import ERC20 from '@primitivefi/contracts/artifacts/ERC20.json'

import { useTransactionAdder } from '@/state/transactions/hooks'
import { useAddNotif } from '@/state/notifs/hooks'

const permit = async (
  signer: ethers.Signer,
  tokenAddress: string,
  account: string,
  spender: string
): Promise<ethers.Transaction> => {
  try {
    if (
      !ethers.utils.isAddress(tokenAddress) ||
      !ethers.utils.isAddress(account)
    ) {
      return null
    }
    const code: any = await signer.provider.getCode(tokenAddress)
    let tx: any
    if (code > 0) {
      const erc20 = new ethers.Contract(tokenAddress, ERC20.abi, signer)
      tx = await erc20.approve(spender, 0) // 0 gwei approval
    } else throw 'Permit Error'
    return tx
  } catch (error) {
    console.error(error)
  }
}

const usePermit = () => {
  const { account, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const now = () => new Date().getTime()
  const throwError = useAddNotif()

  const handleApprove = useCallback(
    async (
      tokenAddress: string,
      spender: string
    ): Promise<ethers.Transaction | any> => {
      const signer = await library.getSigner()
      permit(signer, tokenAddress, account, spender)
        .then((tx) => {
          if (tx?.hash) {
            addTransaction(
              {
                approval: {
                  tokenAddress: tokenAddress,
                  spender: spender,
                },
                hash: tx.hash,
                addedTime: now(),
                from: account,
              },
              Operation.APPROVE
            )
          }
          return tx
        })
        .catch((err) => {
          throwError(0, 'Approvals Error', `${err.message}`, '')
        })
    },
    [account]
  )

  return handleApprove
}

export default usePermit
