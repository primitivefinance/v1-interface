import { Web3Provider } from '@ethersproject/providers'
export const fetcher = (library: Web3Provider) => (...args) => {
  const [method, ...params] = args
  return library[method](...params)
}
