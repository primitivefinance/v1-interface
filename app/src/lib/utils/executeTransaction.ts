import ethers from 'ethers'
import ERC20 from '@primitivefi/contracts/artifacts/ERC20.json'
import Option from '@primitivefi/contracts/artifacts/Option.json'
import { parseEther } from 'ethers/lib/utils'
import { SinglePositionParameters } from '../uniswap'
const MIN_ALLOWANCE: ethers.BigNumber = parseEther('10000000')

const checkAllowance = async (signer, tokenAddress, spenderAddress) => {
  const token = new ethers.Contract(tokenAddress, ERC20.abi, signer)
  const owner = await signer.getAddress()
  const allowance = await token.allowance(owner, spenderAddress)
  console.log(
    `Allowance of token ${tokenAddress} of account ${owner} for ${spenderAddress} is ${allowance}`
  )
  if (allowance < MIN_ALLOWANCE) {
    await token.approve(spenderAddress, MIN_ALLOWANCE)
  }
}

const executeTransaction = async (
  signer: any,
  transaction: SinglePositionParameters
): Promise<any> => {
  let tx: any = {}
  const args = transaction.args
  const path = args[2]
  let token0 = path ? path[0] : null

  if (transaction.methodName === 'openFlashLong') {
    // for each contract
    for (let i = 0; i < transaction.contractsToApprove.length; i++) {
      let contractAddress = transaction.contractsToApprove[i]
      // for each token check allowance
      for (let t = 0; t < transaction.tokensToApprove.length; t++) {
        let tokenAddress = transaction.tokensToApprove[t]
        await checkAllowance(signer, tokenAddress, contractAddress)
      }
    }
  } else {
    await checkAllowance(signer, token0, transaction.contract.address)
  }

  console.log(`Executing transaction:`, transaction)
  try {
    tx = await transaction.contract[transaction.methodName](...args, {
      value: transaction.value,
    })
    console.log(`tx: ${tx}`)
  } catch (err) {
    console.error(
      `Issue when attempting to submit transaction: ${transaction.methodName}`
    )
  }

  return tx
}

export default executeTransaction
