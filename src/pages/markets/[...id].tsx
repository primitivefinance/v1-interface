import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { GetServerSideProps } from 'next'
import { useActiveWeb3React } from '@/hooks/user/index'
import MetaMaskOnboarding from '@metamask/onboarding'
import { useWeb3React } from '@web3-react/core'

import Notifs from '@/components/Notifs'
import Spacer from '@/components/Spacer'
import WethWrapper from '@/components/WethWrapper'

import {
  ADDRESS_FOR_MARKET,
  Operation,
  ACTIVE_EXPIRIES,
} from '@/constants/index'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Grid, Col, Row } from 'react-styled-flexboxgrid'
import { useAddNotif, useClearNotif } from '@/state/notifs/hooks'

import Loader from '@/components/Loader'
import Disclaimer from '@/components/Disclaimer'

import {
  FilterBar,
  MarketHeader,
  OptionsTable,
  TransactionCard,
  OrderCard,
  PositionsCard,
} from '@/components/Market'
import BalanceCard from '@/components/Market/BalanceCard'
import { useItem } from '@/state/order/hooks'

import { useSetLoading } from '@/state/positions/hooks'
import {
  useOptions,
  useUpdateOptions,
  useClearOptions,
} from '@/state/options/hooks'
import { SignitureData, Venue } from '@primitivefi/sdk'

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const data = params?.id

  return {
    props: {
      market: data[0],
      data: data,
    },
  }
}

const Market = ({ market, data }) => {
  const [callPutActive, setCallPutActive] = useState(true)
  const { chainId, active, account, library } = useActiveWeb3React()
  const initExpiry = ACTIVE_EXPIRIES[ACTIVE_EXPIRIES.length - 1]
  const [expiry, setExpiry] = useState(initExpiry)
  const [id, storeId] = useState(chainId)
  const [changing, setChanging] = useState(false)
  const router = useRouter()
  const clear = useClearNotif()
  const options = useOptions()
  const clearOptions = useClearOptions()
  const updateOptions = useUpdateOptions()
  const setLoading = useSetLoading()
  const { item } = useItem()
  const handleFilterType = () => {
    setCallPutActive(!callPutActive)
  }
  useEffect(() => {
    if (item?.entity) {
      setCallPutActive(item.entity.isCall)
    }
  }, [item])
  useEffect(() => {
    const { ethereum, web3 } = window as any
    clearOptions()

    if (MetaMaskOnboarding.isMetaMaskInstalled() && (!ethereum || !web3)) {
      clear(0)
      router.reload()
    }

    if (ethereum) {
      updateOptions(
        market.toUpperCase(),
        Venue.SUSHISWAP,
        false,
        ADDRESS_FOR_MARKET[market]
      )

      const handleChainChanged = () => {
        if (id !== chainId) {
          setChanging(true)
          storeId(chainId)
          // eat errors
          clear(0)
          router.reload()
        }
      }
      const handleAccountChanged = () => {
        if (!options.loading) {
          clear(0)
          setLoading()
        } else {
          router.reload()
        }
      }
      if (ethereum?.on) {
        ethereum?.on('chainChanged', handleChainChanged)
        ethereum?.on('accountsChanged', handleAccountChanged)
      }
      return () => {
        if (ethereum?.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountChanged)
        }
      }
    }
  }, [id, chainId, storeId])

  useEffect(() => {
    if (data[1]) {
      setCallPutActive(data[1] === 'calls')
    }
  }, [data])

  useEffect(() => {
    setExpiry(initExpiry)
  }, [chainId])

  useEffect(() => {
    updateOptions(
      market.toUpperCase(),
      Venue.SUSHISWAP,
      false,
      ADDRESS_FOR_MARKET[market]
    )
  }, [])

  if (!active || market === 'eth') {
    return (
      <>
        <Spacer />
        <Loader size="lg" />
      </>
    )
  }
  if (!(chainId === 42 || chainId === 4 || chainId === 1) && active) {
    return (
      <>
        <Spacer />
        <Text>Switch to Rinkeby, Kovan, or Mainnet Networks</Text>
      </>
    )
  }
  if (
    !MetaMaskOnboarding.isMetaMaskInstalled() ||
    !(window as any)?.ethereum ||
    !(window as any)?.web3
  ) {
    return (
      <>
        <Spacer />
        <Text>Install Metamask to View Markets</Text>
      </>
    )
  }
  if (MetaMaskOnboarding.isMetaMaskInstalled() && !account) {
    return (
      <>
        <Spacer />
        <Text>Connect to Metamask to View Markets</Text>
      </>
    )
  }
  return (
    <ErrorBoundary
      fallback={
        <>
          <Spacer />
          <Text>Error Loading Market, Please Refresh</Text>
        </>
      }
    >
      {changing ? (
        <>
          <Spacer />
          <Spacer />
          <Loader size="lg" />
        </>
      ) : (
        <StyledMarket>
          <Disclaimer />
          <Notifs />
          <Grid id={'market-grid'}>
            <Row>
              <StyledContainer sm={12} md={8} lg={8} id="table-column">
                <StyledMain>
                  <MarketHeader marketId={market}>
                    <FilterBar
                      active={callPutActive}
                      setCallActive={handleFilterType}
                    />
                  </MarketHeader>

                  <Spacer />
                  <ErrorBoundary
                    fallback={
                      <>
                        <Spacer />
                        <Text>Error Loading Options, Please Refresh</Text>
                      </>
                    }
                  >
                    <OptionsTable
                      asset={market}
                      assetAddress={ADDRESS_FOR_MARKET[market]}
                      optionExp={expiry}
                      callActive={callPutActive}
                    />

                    <Downgrade />
                  </ErrorBoundary>
                </StyledMain>
              </StyledContainer>
              <StyledCol sm={12} md={4} lg={4} id="sidebar-column">
                <StyledSideBar>
                  <ErrorBoundary
                    fallback={
                      <>
                        <Spacer />
                        <Text>Error Loading Positions Please Refresh</Text>
                      </>
                    }
                  >
                    <Spacer />
                    <PositionsCard />
                    <OrderCard orderState={data} />
                    <BalanceCard />
                    <Spacer size="sm" />
                    <TransactionCard />

                    <Spacer />
                  </ErrorBoundary>
                </StyledSideBar>
              </StyledCol>
            </Row>
          </Grid>
        </StyledMarket>
      )}
    </ErrorBoundary>
  )
}

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

const Downgrade = () => {
  const { library, chainId, account } = useWeb3React()
  const [option, setOption] = useState(
    '0x5b419b581081f8e38a3c450ae518e0aefd4a32b4'
  ) // weth call
  const [redeem, setRedeem] = useState(
    '0x9E5405a11E42e7d48fbF4F2E979695641c15189b'
  ) //'0x9e5405a11e42e7d48fbf4f2e979695641c15189b') // weth redeem
  const [underlying, setUnderlying] = useState(WETH)
  const [signData, setSignData] = useState<SignitureData>(null)
  const [lpToken, setLpToken] = useState(
    '0x2acbf90fdff006eb6eae2b61145b603e59ade7d2'
  )
  const [approved, setApproved] = useState(false)
  const [submitting, setSubmit] = useState(false)
  const handlePermit = usePermit()
  const addNotif = useAddNotif()
  const onApprove = useApprove()

  const lpTokenBalance = useTokenBalance(lpToken)
  const lpTotalSupply = useTokenTotalSupply(lpToken)

  const redeemTokenBalance = useTokenBalance(redeem)

  const handleApprovalPermit = useCallback(
    (spender: string, amount: BigNumber) => {
      handlePermit(lpToken, spender, amount.toString())
        .then((data) => {
          console.log({ data })
          setSignData(data)
        })
        .catch((error) => {
          addNotif(0, `Approving ${lpToken}`, error.message, '')
        })
    },
    [underlying, lpToken, handlePermit, setSignData]
  )

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

    const calldata = trader.interface.encodeFunctionData('safeUnwind', args)

    console.log([
      option.toString(),
      optionQuantity.toString(),
      account.toString(),
    ])

    /* await trader.safeUnwind(
      option.toString(),
      optionQuantity.toString(),
      account.toString()
    ) */
    await callTrader(trader, 'safeUnwind', args)
  }, [library, account, redeemTokenBalance])

  const removeLiquidity = useCallback(async () => {
    const signer = await getSigner()
    const router = new ethers.Contract(ROUTER, RouterAbi, signer)
    const liquidity = new ethers.Contract(LIQUIDITY, LiquidityAbi, signer)

    const pool = lpToken
    const reserves = await getReserves(library, pool)
    console.log(reserves)

    const [token0, token1] =
      underlying.toLowerCase() < redeem.toLowerCase()
        ? [underlying, redeem]
        : [redeem, underlying]

    const [reserve0, reserve1] = [reserves._reserve0, reserves._reserve1]

    const isUnderlying = token0 == underlying ? true : false

    const [underlyingReserve, redeemReserve] = isUnderlying
      ? [reserve0, reserve1]
      : [reserve1, reserve0]
    console.log(underlyingReserve, redeemReserve)

    const inputAmount = ethers.utils.parseEther(lpTokenBalance.toString()) // amount of liquidity in users wallet
    const totalSupply = ethers.utils.parseEther(lpTotalSupply)
    // should always be redeem
    let amountAMin = BigNumber.from(inputAmount)
      .mul(redeemReserve)
      .div(totalSupply)
    // should always be underlying
    let amountBMin = BigNumber.from(inputAmount)
      .mul(underlyingReserve)
      .div(totalSupply)

    /*  amountAMin = trade.calcMinimumOutSlippage(
      amountAMin.toString(),
      tradeSettings.slippage
    )
    amountBMin = trade.calcMinimumOutSlippage(
      amountBMin.toString(),
      tradeSettings.slippage
    ) */

    const value = '0'
    const deadline = signData ? signData.deadline : 1000000000000000
    const params = liquidity.interface.encodeFunctionData(
      'removeShortLiquidityThenCloseOptionsWithPermit',
      [
        option,
        inputAmount,
        amountAMin.toString(),
        amountBMin.toString(),
        deadline,
        signData.v,
        signData.r,
        signData.s,
      ]
    )

    const calldata = router.interface.encodeFunctionData('executeCall', [
      LIQUIDITY,
      params,
    ])

    await executeTransaction(library, ROUTER, calldata, value)
  }, [account, library])

  const isLPApproved = useCallback(() => {
    return approved || signData
  }, [approved, signData])

  const isRDMApproved = useCallback(() => {
    return approved || signData
  }, [approved, signData])

  const handleApproval = useCallback(
    (token: string, spender: string, amount: string) => {
      onApprove(token, spender, amount)
        .then()
        .catch((error) => {
          addNotif(0, `Approving ${token} for ${spender}`, error.message, '')
        })
    },
    [underlying, onApprove]
  )

  return (
    <div>
      <Text> Test</Text>
      {isLPApproved() ? (
        <></>
      ) : (
        <Button
          disabled={submitting}
          full
          size="sm"
          onClick={() =>
            handleApprovalPermit(ROUTER, ethers.constants.MaxUint256)
          }
          isLoading={submitting}
          text="Permit LP Tokens"
        />
      )}

      <Button
        disabled={submitting}
        full
        size="sm"
        onClick={removeLiquidity}
        isLoading={submitting}
        text={'Remove Liquidity'}
      />

      {isRDMApproved() ? (
        <></>
      ) : (
        <Button
          disabled={submitting}
          full
          size="sm"
          onClick={() =>
            handleApproval(
              redeem,
              TRADER,
              parseEther('1000000000000').toString()
            )
          }
          isLoading={submitting}
          text="Approve Redeem"
        />
      )}

      <Button
        disabled={submitting}
        full
        size="sm"
        onClick={safeUnwind}
        isLoading={submitting}
        text={'Close Position'}
      />
    </div>
  )
}

const StyledCol = styled(Col)`
  overflow-x: hidden;
`

const StyledContainer = styled(Col)`
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 1;
`
const StyledMain = styled.div``

const StyledMarket = styled.div`
  width: 100%;
  height: 90%;
  position: absolute;
  overflow-x: hidden;
  overflow-y: hidden;
  &::-webkit-scrollbar {
    width: 1px;
    height: 15px;
  }

  &::-webkit-scrollbar-track-piece {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb:vertical {
    height: 30px;
    background-color: ${(props) => props.theme.color.grey[600]};
  }
  scrollbar-color: transparent;
  scrollbar-width: thin;
`

const StyledSideBar = styled.div`
  background: none;
  width: 25em;
  box-sizing: border-box;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  padding: ${(props) => props.theme.spacing[2]}px
    ${(props) => props.theme.spacing[2]}px
    ${(props) => props.theme.spacing[4]}px
    ${(props) => props.theme.spacing[4]}px;
  padding-top: 0 !important;
  height: 90vh;
  position: fixed;
  overflow: auto;
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: scroll !important;
  justify-content: center;
  &::-webkit-scrollbar {
    width: 5px;
    height: 15px;
  }
  &::-webkit-scrollbar {
    width: 1px;
    height: 15px;
  }

  &::-webkit-scrollbar-track-piece {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb:vertical {
    height: 30px;
    background-color: transparent;
  }
  scrollbar-color: transparent;
  scrollbar-width: thin;
`
const Text = styled.span`
  color: ${(props) => props.theme.color.white};
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
`

export default Market
