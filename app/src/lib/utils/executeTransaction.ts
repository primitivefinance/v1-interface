import ethers, { BigNumberish } from 'ethers'
import ERC20 from '@primitivefi/contracts/artifacts/ERC20.json'
import Option from '@primitivefi/contracts/artifacts/Option.json'
import { parseEther } from 'ethers/lib/utils'
import { SinglePositionParameters } from '../types'
const MIN_ALLOWANCE: ethers.BigNumber = parseEther('10000000')
import { Transaction } from '@/contexts/Transactions/types'

export const checkAllowance = async (
  signer,
  tokenAddress,
  spenderAddress
): Promise<BigNumberish> => {
  const token = new ethers.Contract(tokenAddress, ERC20.abi, signer)
  const owner = await signer.getAddress()
  const allowance = await token.allowance(owner, spenderAddress)
  console.log(
    `Allowance of token ${tokenAddress} of account ${owner} for ${spenderAddress} is ${allowance}`
  )
  return allowance
}

export const executeApprove = async (
  signer,
  tokenAddress,
  spenderAddress
): Promise<Transaction> => {
  const token = new ethers.Contract(tokenAddress, ERC20.abi, signer)
  const tx: Transaction = await token.approve(spenderAddress, MIN_ALLOWANCE)
  return tx
}

const executeTransaction = async (
  signer: any,
  transaction: SinglePositionParameters
): Promise<any> => {
  let tx: any = {}
  const args = transaction.args

  const approvalTxs: any[] = []
  if (transaction.tokensToApprove.length > 0) {
    // for each contract
    for (let i = 0; i < transaction.contractsToApprove.length; i++) {
      const contractAddress = transaction.contractsToApprove[i]
      // for each token check allowance
      for (let t = 0; t < transaction.tokensToApprove.length; t++) {
        const tokenAddress = transaction.tokensToApprove[t]
        checkAllowance(signer, tokenAddress, contractAddress)
          .then((tx) => {
            approvalTxs.push(tx)
          })
          .catch((err) => {
            throw Error(`Approving transaction issue: ${err}`)
          })
      }
    }
  }

  console.log(`Executing transaction:`, transaction)
  try {
    tx = await transaction.contract[transaction.methodName](...args, {
      value: transaction.value,
    })
    console.log(`tx: ${tx}`)
  } catch (err) {
    throw Error(
      `Issue when attempting to submit transaction: ${transaction.methodName}`
    )
  }

  return tx
}

export default executeTransaction
