import { useCallback, useEffect, useState } from 'react'
import { parseEther, formatEther } from 'ethers/lib/utils'

import { useWeb3React } from '@web3-react/core'

import { getBalance, SUSHI_FACTORY_ADDRESS } from '@primitivefi/sdk'
import ethers, { BigNumberish } from 'ethers'
import { isAddress, getAddress } from '@ethersproject/address'
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json'

const useGetPair = (tokenA: string, tokenB: string) => {
  const [pair, setPair] = useState(ethers.constants.AddressZero)
  const { account, library, chainId } = useWeb3React()

  const fetchPair = useCallback(async () => {
    if (
      typeof tokenA === 'undefined' ||
      tokenA === '' ||
      typeof tokenB === 'undefined' ||
      tokenB === ''
    )
      return
    if (!isAddress(getAddress(tokenA))) return
    if (!isAddress(getAddress(tokenB))) return
    const factory: ethers.Contract = new ethers.Contract(
      SUSHI_FACTORY_ADDRESS[chainId],
      UniswapV2Factory.abi,
      library
    )
    const code: any = await library.getCode(factory.address)
    let pair: string = ethers.constants.AddressZero
    if (code > 0) {
      pair = await factory.getPair(tokenA, tokenB)
    }
    if (pair) {
      setPair(pair)
    }
  }, [account, library, tokenA, tokenB])

  useEffect(() => {
    if (account && library) {
      fetchPair()
      const refreshInterval = setInterval(fetchPair, 50000000)
      return () => clearInterval(refreshInterval)
    }
  }, [account, library, setPair, tokenA, tokenB])

  return pair
}

export default useGetPair
