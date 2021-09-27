import React, { useState, useEffect, useCallback } from 'react'

import { useWeb3React } from '@web3-react/core'

import { useAddNotif, useClearNotif } from '@/state/notifs/hooks'

import { getAllowance, SignitureData, Venue } from '@primitivefi/sdk'

const TRADER = '0xc1de48E9577A7CF18594323A73CDcF1EE19962E8'
const ROUTER = '0x9264416B621054e16fAB8d6423b5a1e354D19fEc'
const LIQUIDITY = '0x996Eeff28277FD17738913e573D1c452b4377A16'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

import { optionAddresses, tokens } from '@/constants/options'

import { abi as RouterAbi } from '@primitivefi/v1-connectors/build/contracts/PrimitiveRouter.sol/PrimitiveRouter.json'
import { abi as LiquidityAbi } from '@primitivefi/v1-connectors/build/contracts/connectors/PrimitiveLiquidity.sol/PrimitiveLiquidity.json'
import { abi as TraderAbi } from '@primitivefi/contracts/artifacts/contracts/option/extensions/Trader.sol/Trader.json'
import { abi as OptionAbi } from '@primitivefi/contracts/artifacts/contracts/option/primitives/Option.sol/Option.json'

import { ethers } from 'ethers'
import { usePermit } from '@/hooks/transactions/usePermit'
import { useItem } from '@/state/order/hooks'

import styled from 'styled-components'
async function executeTransaction(
  provider: any,
  target: string,
  calldata: string,
  value: string
): Promise<any> {
  console.log(` executing tx: ${target} ${calldata}`)
  let tx: any = {}
  try {
    tx = await provider
      .getSigner()
      .sendTransaction({ to: target, data: calldata, value })
    console.log(`tx: ${tx}`)
  } catch (err) {
    throw Error(`Issue when attempting to submit transaction`)
  }

  return tx
}

async function callTrader(
  trader: ethers.Contract,
  method: string,
  args: any[]
): Promise<any> {
  console.log(` executing tx: ${args}`)
  let tx: any = {}
  try {
    tx = await trader[method](...args)
    console.log(`tx: ${tx}`)
  } catch (err) {
    throw Error(`Issue when attempting to submit transaction`)
  }

  return tx
}

async function getReserves(provider: any, target: string) {
  const signer = await provider.getSigner()
  const pool = new ethers.Contract(target, PairAbi, signer)
  const data = pool.interface.encodeFunctionData('getReserves', [])
  const value = '0'
  const reserves = await pool.getReserves()
  return reserves
}

async function getParameters(signer: any, option: string) {
  const token = new ethers.Contract(option, OptionAbi, signer)
  const params = await token.getParameters()
  return params
}

import { BigNumber } from '@ethersproject/bignumber'
import { TokenAmount } from '@sushiswap/sdk'
import useTokenBalance from '@/hooks/useTokenBalance'
import { abi as PairAbi } from '@uniswap/v2-core/build/UniswapV2Pair.json'
import useTokenTotalSupply from '@/hooks/useTokenTotalSupply'
import Button from '@/components/Button'
import { parseEther } from '@ethersproject/units'
import useApprove from '@/hooks/transactions/useApprove'
import useTokenAllowance from '@/hooks/useTokenAllowance'

const allOptions = {
  option0: {
    underlying: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', //weth
    option: '0x5b419b581081f8e38a3c450ae518e0aefd4a32b4', // weth call long
    redeem: '0x9e5405a11e42e7d48fbf4f2e979695641c15189b', // weth call short
    lp: '0x2acbf90fdff006eb6eae2b61145b603e59ade7d2', // weth call lp
  },
  option1: {
    underlying: '0x6b175474e89094c44da98b954eedeac495271d0f', // dai
    option: '0x5b83dec645be2b8137a20175f59000c20c6dce82', // weth put long
    redeem: '0xcfc9a86fccf24ef495194540e1a3d3d523893355', // weth put short
    lp: '0xfe7f6780a3c19aef662edd7076f63c2ae99a2196', // weth put LP
  },
  option2: {
    underlying: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2', // sushi
    option: '0x875f1f8e7426b91c388807d5257f73700d04d653', // sushi call long
    redeem: '0x81eb1e0acfd705c34e975397de7545b6a9f0be39', // sushi call short
    lp: '0xbff6cbf2e7d2cd0705329c735a37be33241298e9', // sushi call LP
  },
  option3: {
    underlying: '0x6b175474e89094c44da98b954eedeac495271d0f', // dai
    option: '0x6688E09a0af5dAfa2a6dcD09f180F084ad964005', // sushi put long
    redeem: '0xee1482a2c48f0012862e45a992666096fc767b78', // sushi put short
    lp: '0x45e185Be5d2FE76b71fE4283EaAD9679E674c77f', // sushi put LP
  },
}

const Downgrade = () => {
  const { library, chainId, account } = useWeb3React()

  const [signData, setSignData] = useState<SignitureData>(null)

  const [approved, setApproved] = useState(false)
  const [submitting, setSubmit] = useState(false)
  const handlePermit = usePermit()
  const addNotif = useAddNotif()
  const onApprove = useApprove()

  const { item } = useItem()
  const redeem = item.entity.redeem.address
  const option = item.entity.address
  const lpToken = item.entity.sushiswapPairAddress
  const underlying = item.entity.underlying.symbol

  const lpTokenBalance = useTokenBalance(lpToken)
  const lpTotalSupply = useTokenTotalSupply(lpToken)
  const redeemAllowance = useTokenAllowance(redeem, TRADER)

  const redeemTokenBalance = useTokenBalance(redeem)

  const getSigner = useCallback(async () => {
    if (library) {
      return await library.getSigner()
    }
  }, [library])

  const safeUnwind = useCallback(async () => {
    const signer = await getSigner()
    const trader = new ethers.Contract(TRADER, TraderAbi, signer)

    const balance = parseEther(redeemTokenBalance)
    const { _base, _quote } = await getParameters(signer, option)
    const optionQuantity = balance.mul(_base).div(_quote)
    console.log(
      optionQuantity.toString(),
      balance.toString(),
      _base.toString(),
      _quote.toString()
    )

    const args = [option, optionQuantity.toString(), account]

    await callTrader(trader, 'safeUnwind', args)
  }, [library, account, redeemTokenBalance])

  const isRDMApproved = useCallback(() => {
    return redeemAllowance > redeemTokenBalance
  }, [library, redeemAllowance, redeemTokenBalance])

  const handleApproval = useCallback(
    (amount: string) => {
      onApprove(redeem, TRADER, amount)
        .then(() => {
          setApproved(true)
        })
        .catch((error) => {
          addNotif(0, `Approving ${redeem} for ${TRADER}`, error.message, '')
        })
    },
    [redeem, onApprove]
  )
  return (
    <div>
      <Style>
        <span>RDM Balance</span> {parseFloat(redeemTokenBalance)}
      </Style>

      <Button
        disabled={false}
        full
        size="sm"
        onClick={() => handleApproval(parseEther('1000000000000').toString())}
        isLoading={submitting}
        text="Approve Redeem"
      />
      <Button
        disabled={false}
        full
        size="sm"
        onClick={safeUnwind}
        isLoading={submitting}
        text={'Close Position'}
      />
    </div>
  )
}

const Style = styled.div`
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 1em;
`
export default Downgrade
