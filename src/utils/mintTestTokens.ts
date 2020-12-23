import ethers from 'ethers'
import ERC20 from '@primitivefi/contracts/artifacts/TestERC20.json'

/* const mintTestTokens = async (address: string, signer: ethers.Signer) => {
  const tokenArray = [
    '0x70202b6ef79deee9c0bfd3e93f7704f289b0f684',
    '0xcbc6cd7df1deb8d9b77783ede5659e8228f7bf64',
    '0x552cee895bb1cb928699793df6249486ec50e94c',
    '0xe332f2f021f9b8b2367598c48ae319136cef6d62',
    '0x0328807d22ec485d1a01ffdcfd19fd375c2f1112',
    '0x056e1ef9df4f1d0a5cc82bb3fa5c934b4df889b7',
    '0x82e2dbd5fddde3a44f7278b279025c5b2b9d657b',
    '0xf35e127ac7087a8361edd5d8c3f178150710ed4b',
  ]

  const amount = ethers.utils.parseEther('1000000000')
  for (let token of tokenArray) {
    const contract = new ethers.Contract(token, ERC20.abi, signer)
    await contract.mint(address, amount)
   }
}*/
const mintTestTokens = async (
  address: string,
  token: string,
  signer: ethers.Signer
): Promise<any> => {
  const amount = ethers.utils.parseEther('1000000000')

  const contract = new ethers.Contract(token, ERC20.abi, signer)
  contract
    .mint(address, amount)
    .then((tx: ethers.Transaction) => {
      return tx
    })
    .catch((err) => {
      console.log(`Issue when minting test tokens ${err}`)
      return null
    })
}
export default mintTestTokens
