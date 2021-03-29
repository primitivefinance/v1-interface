import ethers from 'ethers'
import Engine from './Engine.json'
const getAccumulator = async (signer: ethers.Signer): Promise<any> => {
  const contract = new ethers.Contract(
    '0x20E42bB1a3174d931691d77c4CFe1a116F1415bB',
    Engine.abi,
    signer
  )
  contract
    .getAccumulator()
    .then((tx: ethers.Transaction) => {
      return tx
    })
    .catch((err) => {
      console.log(`Issue when minting test tokens ${err}`)
      return null
    })
}
export default getAccumulator
