import { Web3Provider } from '@ethersproject/providers'
export const fetcher = (library: Web3Provider) => (...args) => {
  const [method, ...params] = args
  console.log(method, params)
  return library[method](...params)
}
