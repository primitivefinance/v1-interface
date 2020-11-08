import ethers, { BigNumberish } from 'ethers'
import ERC20 from '@primitivefi/contracts/artifacts/ERC20.json'

export const getBalance = async (
  provider: ethers.providers.Provider | ethers.providers.JsonRpcProvider,
  tokenAddress: string,
  account: string
): Promise<BigNumberish> => {
  try {
    if (
      !ethers.utils.isAddress(tokenAddress) ||
      !ethers.utils.isAddress(account)
    ) {
      return 0
    }
    let code: any = await provider.getCode(tokenAddress)
    let balance: BigNumberish = 0
    if (code > 0) {
      const erc20 = new ethers.Contract(tokenAddress, ERC20.abi, provider)
      balance = await erc20.balanceOf(account)
    }
    return balance
  } catch (error) {
    console.error(error)
  }
}

export const getAllowance = async (
  provider: ethers.providers.Provider | ethers.providers.JsonRpcProvider,
  tokenAddress: string,
  account: string,
  spender: string
): Promise<BigNumberish> => {
  try {
    if (
      !ethers.utils.isAddress(tokenAddress) ||
      !ethers.utils.isAddress(account)
    ) {
      return 0
    }
    let code: any = await provider.getCode(tokenAddress)
    let allowance: BigNumberish = 0
    if (code > 0) {
      const erc20 = new ethers.Contract(tokenAddress, ERC20.abi, provider)
      allowance = await erc20.allowance(account, spender)
    }
    return allowance
  } catch (error) {
    throw Error(`Getting allowance issue: ${error}`)
  }
}
