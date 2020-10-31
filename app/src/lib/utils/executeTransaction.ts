import ethers from 'ethers'
import ERC20 from '@primitivefi/contracts/artifacts/ERC20.json'
import Option from '@primitivefi/contracts/artifacts/Option.json'
import { parseEther } from 'ethers/lib/utils'
import { SinglePositionParameters } from '../uniswap'
const MIN_ALLOWANCE: ethers.BigNumber = parseEther('10000000')

const checkAllowance = async (signer, tokenAddress, spenderAddress) => {
  console.log(`Checking allowance: ${tokenAddress} ${spenderAddress}`)
  const token = new ethers.Contract(tokenAddress, ERC20.abi, signer)
  const owner = await signer.getAddress()
  const allowance = await token.allowance(owner, spenderAddress)
  console.log(`Allowance for: ${tokenAddress} is ${allowance}`)
  if (allowance < MIN_ALLOWANCE) {
    await token.approve(spenderAddress, MIN_ALLOWANCE)
  }
}

const executeTransaction = async (
  signer: any,
  transaction: SinglePositionParameters
): Promise<any> => {
  let tx: any = {}
  console.log(transaction)
  const args = transaction.args
  const path = args[2]
  let token0 = path ? path[0] : null

  if (transaction.methodName === 'openFlashLong') {
    let option: string = args[0]
    let token: string = option
    let optionToken = new ethers.Contract(token, Option.abi, signer)
    let underlying = await optionToken.getUnderlyingTokenAddress()
    await checkAllowance(signer, underlying, transaction.contract.address)
    console.log(`Contract name: ${await transaction.contract.getName()}`)
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
