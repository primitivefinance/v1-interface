import ethers, { BigNumberish } from 'ethers'
import ERC20 from '@primitivefi/contracts/artifacts/ERC20.json'

export const approve = async (
  signer: ethers.Signer,
  tokenAddress: string,
  account: string,
  spender: string
): Promise<BigNumberish> => {
  try {
    if (
      !ethers.utils.isAddress(tokenAddress) ||
      !ethers.utils.isAddress(account)
    ) {
      return null
    }
    let code: any = await signer.provider.getCode(tokenAddress)
    let tx: any
    if (code > 0) {
      const erc20 = new ethers.Contract(tokenAddress, ERC20.abi, signer)
      tx = await erc20.approve(spender, ethers.constants.MaxUint256)
    }
    return tx
  } catch (error) {
    console.error(error)
  }
}

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

export const getTotalSupply = async (
  provider: ethers.providers.Provider | ethers.providers.JsonRpcProvider,
  tokenAddress: string
): Promise<BigNumberish> => {
  try {
    if (!ethers.utils.isAddress(tokenAddress)) {
      return 0
    }
    const code: any = await provider.getCode(tokenAddress)
    let balance: BigNumberish = 0
    if (code > 0) {
      const erc20 = new ethers.Contract(tokenAddress, ERC20.abi, provider)
      balance = await erc20.totalSupply()
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
