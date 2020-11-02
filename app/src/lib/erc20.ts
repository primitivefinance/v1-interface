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
    const erc20 = new ethers.Contract(tokenAddress, ERC20.abi, provider)
    const balance = await erc20.balanceOf(account)
    return balance
  } catch (error) {
    console.error(error)
  }
}
