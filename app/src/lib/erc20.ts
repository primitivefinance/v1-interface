import ethers from 'ethers'
import ERC20 from '@primitivefi/contracts/artifacts/ERC20.json'

export const getBalance = async (provider, tokenAddress, account) => {
  try {
    const erc20 = new ethers.Contract(tokenAddress, ERC20.abi, provider)
    const balance = await erc20.balanceOf(account)
    return balance
  } catch (error) {
    console.error(error)
  }
}
