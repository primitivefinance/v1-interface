import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'

import { removeItem, updateItem } from './actions'

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import ethers, { BigNumberish, BigNumber } from 'ethers'
import numeral from 'numeral'
import { Token, TokenAmount, Pair, JSBI, BigintIsh } from '@sushiswap/sdk'
import * as SushiSwapSDK from '@sushiswap/sdk'
import { OptionsAttributes } from '../options/actions'
import {
  DEFAULT_DEADLINE,
  DEFAULT_TIMELIMIT,
  STABLECOINS,
  DEFAULT_ALLOWANCE,
  ADDRESS_ZERO,
} from '@/constants/index'
import useTokenBalance from '@/hooks/useTokenBalance'

import { FACTORY_ADDRESS } from '@sushiswap/sdk'
import {
  SignitureData,
  SUSHI_ROUTER_ADDRESS,
  SushiSwapMarket,
} from '@primitivefi/sdk'
import {
  Option,
  createOptionEntityWithAddress,
  SUSHI_FACTORY_ADDRESS,
  getBalance,
} from '@primitivefi/sdk'
import { parseEther, formatEther } from 'ethers/lib/utils'
import {
  Trade,
  Trader,
  SushiSwap,
  Venue,
  PRIMITIVE_ROUTER,
  TRADER,
  Operation,
} from '@primitivefi/sdk'
import { TradeSettings, SinglePositionParameters } from '@primitivefi/sdk'
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json'
import useTokenAllowance, {
  useGetTokenAllowance,
} from '@/hooks/useTokenAllowance'
/* import { Operation, PRIMITIVE_ROUTER, TRADER } from '@/constants/index' */
import { useReserves } from '@/hooks/data'
import executeTransaction from '@/utils/executeTransaction'

import { useSlippage } from '@/state/user/hooks'
import { useBlockNumber } from '@/hooks/data'
import { useTransactionAdder } from '@/state/transactions/hooks'
import { useAddNotif } from '@/state/notifs/hooks'
import { useClearSwap, useToggleReduce } from '@/state/swap/hooks'
import { useClearLP } from '@/state/liquidity/hooks'
import { getTotalSupply, WETH9 } from '@primitivefi/sdk'

const EMPTY_TOKEN: Token = new Token(1, ADDRESS_ZERO, 18)

export const useItem = (): {
  item: OptionsAttributes
  orderType: Operation
  loading: boolean
  approved: boolean[]
  checked: boolean
} => {
  const state = useSelector<AppState, AppState['order']>((state) => state.order)
  return state
}

export const useUpdateItem = (): ((
  item: OptionsAttributes,
  orderType: Operation,
  lpPair?: Pair | SushiSwapSDK.Pair,
  reset?: boolean
) => void) => {
  const { library, account, chainId } = useWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const getAllowance = useGetTokenAllowance()
  const clear = useClearSwap()
  const clearLP = useClearLP()
  return useCallback(
    async (
      item: OptionsAttributes,
      orderType: Operation,
      lpPair?: Pair | SushiSwapSDK.Pair | null,
      reset?: boolean
    ) => {
      dispatch(
        updateItem({
          item,
          orderType,
          loading: true,
          approved: [false, false],
        })
      )

      let manage = false
      switch (orderType) {
        case Operation.MINT:
          manage = true
          break
        case Operation.EXERCISE:
          manage = true
          break
        case Operation.REDEEM:
          manage = true
          break
        case Operation.CLOSE:
          manage = true
          break
        default:
          break
      }
      if (!reset) {
        clear()
        clearLP()
      }

      if (orderType === Operation.NONE) {
        dispatch(
          updateItem({
            item,
            orderType,
            loading: false,
            approved: [false, false],
          })
        )
        return
      } else {
        if (
          orderType === Operation.ADD_LIQUIDITY ||
          orderType === Operation.ADD_LIQUIDITY_CUSTOM ||
          orderType === Operation.REMOVE_LIQUIDITY_CLOSE
        ) {
          const spender =
            item.venue === Venue.UNISWAP
              ? PRIMITIVE_ROUTER[chainId].address
              : PRIMITIVE_ROUTER[chainId].address
          if (
            orderType === Operation.ADD_LIQUIDITY ||
            orderType === Operation.ADD_LIQUIDITY_CUSTOM
          ) {
            const tokenAllowance = await getAllowance(
              item.entity.underlying.address,
              spender
            )
            const tokenBalance = await getBalance(
              library,
              item.entity.underlying.address,
              account
            )

            const approved =
              parseEther(tokenAllowance.toString()).gt(
                parseEther(tokenBalance.toString())
              ) || item.entity.underlying.address === WETH9[chainId].address
            dispatch(
              updateItem({
                item,
                orderType,
                loading: false,
                approved: [approved, false],
              })
            )
            return
          }
          if (
            orderType === Operation.REMOVE_LIQUIDITY_CLOSE &&
            item.market.liquidityToken
          ) {
            const lpToken = item.market.liquidityToken.address
            const optionAllowance = await getAllowance(
              item.entity.address,
              spender
            )
            const lpAllowance = await getAllowance(lpToken, spender)
            const longBalance = await getBalance(
              library,
              item.entity.address,
              account
            )

            const lpBalance = await getBalance(
              library,
              item.market.liquidityToken.address,
              account
            )
            dispatch(
              updateItem({
                item,
                orderType,
                loading: false,
                approved: [
                  parseEther(optionAllowance.toString()).gt(
                    parseEther(longBalance.toString())
                  ),
                  parseEther(lpAllowance.toString()).gt(
                    parseEther(lpBalance.toString())
                  ),
                ],
              })
            )
            return
          }
        } else if (orderType === Operation.REMOVE_LIQUIDITY) {
          const spender =
            item.venue === Venue.UNISWAP
              ? SUSHI_ROUTER_ADDRESS[chainId]
              : PRIMITIVE_ROUTER[chainId].address
          if (item.market) {
            const lpToken = item.market.liquidityToken.address
            const optionAllowance = await getAllowance(
              item.entity.address,
              spender
            )
            const lpAllowance = await getAllowance(lpToken, spender)
            const longBalance = await getBalance(
              library,
              item.entity.address,
              account
            )

            const lpBalance = await getBalance(
              library,
              item.market.liquidityToken.address,
              account
            )
            dispatch(
              updateItem({
                item,
                orderType,
                loading: false,
                approved: [
                  parseEther(optionAllowance.toString()).gt(
                    parseEther(longBalance.toString())
                  ),
                  parseEther(lpAllowance.toString()).gt(
                    parseEther(lpBalance.toString())
                  ),
                ],
              })
            )
            return
          }
        } else if (manage) {
          let tokenAddress
          let secondaryAddress
          switch (orderType) {
            case Operation.MINT:
              tokenAddress = item.entity.underlying.address
              break
            case Operation.EXERCISE:
              tokenAddress = item.entity.address
              secondaryAddress = item.entity.strike.address
              break
            case Operation.REDEEM:
              tokenAddress = item.entity.redeem.address
              break
            case Operation.CLOSE:
              tokenAddress = item.entity.address
              secondaryAddress = item.entity.redeem.address
              break
            default:
              break
          }
          const spender = TRADER[chainId].address
          const tokenAllowance = await getAllowance(tokenAddress, spender)
          let secondaryAllowance = '0'
          if (secondaryAddress) {
            secondaryAllowance = await getAllowance(secondaryAddress, spender)
          }
          const secondaryBal = await getBalance(
            library,
            secondaryAddress,
            account
          )
          const tokenBalance = await getBalance(
            library,
            item.entity.underlying.address,
            account
          )
          dispatch(
            updateItem({
              item,
              orderType,
              loading: false,
              approved: [
                parseEther(tokenAllowance).gt(
                  parseEther(tokenBalance.toString())
                ),
                parseEther(secondaryAllowance).gt(
                  parseEther(secondaryBal.toString())
                ),
              ],
            })
          )
          return
        } else {
          const isUniswap = item.venue === Venue.UNISWAP ? true : false
          const spender =
            orderType === Operation.CLOSE_SHORT || orderType === Operation.SHORT
              ? !isUniswap
                ? SUSHI_ROUTER_ADDRESS[chainId]
                : PRIMITIVE_ROUTER[chainId].address
              : isUniswap
              ? PRIMITIVE_ROUTER[chainId].address
              : PRIMITIVE_ROUTER[chainId].address

          let tokenAddress
          let secondaryAddress
          switch (orderType) {
            case Operation.LONG:
              tokenAddress = item.entity.underlying.address
              break
            case Operation.SHORT:
              tokenAddress = item.entity.underlying.address
              break
            case Operation.CLOSE_LONG:
              tokenAddress = item.entity.address
              break
            case Operation.CLOSE_SHORT:
              tokenAddress = item.entity.redeem.address
              break
            default:
              tokenAddress = item.entity.underlying.address
              break
          }
          const tokenAllowance = await getAllowance(tokenAddress, spender)
          let secondaryAllowance
          if (secondaryAddress) {
            secondaryAllowance = await getAllowance(secondaryAddress, spender)
          } else {
            secondaryAllowance = '0'
          }

          const primaryBal = await getBalance(library, tokenAddress, account)
          const secondaryBal = await getBalance(
            library,
            secondaryAddress,
            account
          )
          dispatch(
            updateItem({
              item,
              orderType,
              loading: false,
              approved: [
                parseEther(tokenAllowance.toString()).gt(
                  parseEther(primaryBal.toString())
                ),
                parseEther(secondaryAllowance.toString()).gt(
                  parseEther(secondaryBal.toString())
                ),
              ],
            })
          )
          return
        }
      }
    },
    [dispatch, chainId, updateItem]
  )
}

export const useRemoveItem = (): (() => void) => {
  const dispatch = useDispatch<AppDispatch>()
  const toggleReduce = useToggleReduce()

  return useCallback(() => {
    toggleReduce(true)

    dispatch(removeItem())
  }, [dispatch])
}
export interface SigData {
  v: number
  r: string
  s: string
  deadline: number
}

export const useHandleSubmitOrder = (): ((
  provider: Web3Provider,
  parsedAmountA: BigInt,
  operation: Operation,
  parsedAmountB?: BigInt,
  sigData?: SigData
) => void) => {
  const dispatch = useDispatch<AppDispatch>()
  const addTransaction = useTransactionAdder()
  const { item, orderType, approved } = useItem()
  const removeItem = useRemoveItem()
  const { chainId, account } = useWeb3React()
  const slippage = useSlippage()
  const { data } = useBlockNumber()
  const throwError = useAddNotif()
  const now = () => new Date().getTime()

  return useCallback(
    async (
      provider: Web3Provider,
      parsedAmountA: BigInt,
      operation: Operation,
      parsedAmountB?: BigInt,
      sigData: SigData = null
    ) => {
      dispatch(
        updateItem({
          item,
          orderType,
          loading: true,
          approved,
        })
      )
      const optionEntity: Option = item.entity
      const signer: ethers.Signer = await provider.getSigner()
      const tradeSettings: TradeSettings = {
        slippage: '0.0',
        timeLimit: 0,
        receiver: account,
        deadline: sigData ? sigData.deadline : 1000000000000000,
        stablecoin: STABLECOINS[chainId].address,
      }

      const factory = new ethers.Contract(
        SUSHI_FACTORY_ADDRESS[chainId],
        UniswapV2Factory.abi,
        signer
      )

      const totalSupply: BigNumberish = await getTotalSupply(
        provider,
        item.market.liquidityToken.address
      )

      //console.log(parseInt(parsedAmountA) * 1000000000000000000)
      const inputAmount: TokenAmount = new TokenAmount(
        EMPTY_TOKEN, // fix with actual metadata
        BigInt(parsedAmountA.toString()).toString()
      )
      const outputAmount: TokenAmount = new TokenAmount(
        EMPTY_TOKEN, // fix with actual metadata
        BigInt(parsedAmountB.toString()).toString()
      )

      let out: BigNumberish
      const path: string[] = []
      const amountsIn: BigNumberish[] = []
      const amountsOut: BigNumberish[] = []
      const reserves: BigNumberish[] = []

      const trade: Trade = new Trade(
        optionEntity,
        item.market,
        totalSupply,
        inputAmount,
        outputAmount,
        operation,
        item.venue,
        signer,
        sigData
      )

      // type SinglePositionParameters fails due to difference in Trader and SushiSwap type
      let transaction: any
      switch (operation) {
        case Operation.LONG:
          // Need to borrow exact amount of underlyingTokens, so exact output needs to be the parsedAmount.
          // path: redeem -> underlying, getInputAmount is the redeem cost
          trade.inputAmount = new TokenAmount(optionEntity.redeem, '0')
          trade.outputAmount = new TokenAmount(
            optionEntity.underlying,
            parsedAmountA.toString()
          )
          transaction = SushiSwap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.SHORT:
          // Going SHORT on an option effectively means holding the SHORT OPTION TOKENS.
          // Purchase them for underlyingTokens from the underlying<>redeem UniswapV2Pair.
          // exact output means our input is what we need to solve for
          trade.outputAmount = new TokenAmount(
            optionEntity.redeem,
            parsedAmountA.toString()
          )
          trade.inputAmount = trade.market.getInputAmount(trade.outputAmount)[0]
          transaction = SushiSwap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.CLOSE_LONG:
          // Path: underlying -> redeem, exact redeem amount is outputAmount.
          trade.outputAmount = new TokenAmount(
            optionEntity.redeem,
            optionEntity.proportionalShort(parsedAmountA.toString()).toString()
          )
          console.log(trade.outputAmount.raw.toString())
          transaction = SushiSwap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.CLOSE_SHORT:
          trade.inputAmount = new TokenAmount(
            optionEntity.redeem,
            parsedAmountA.toString()
          )
          trade.outputAmount = trade.market.getOutputAmount(
            trade.inputAmount
          )[0]

          transaction = SushiSwap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.ADD_LIQUIDITY:
          tradeSettings.slippage = '0.01'
          // primary input is the options deposit (underlying tokens)
          trade.inputAmount = new TokenAmount(
            optionEntity,
            parsedAmountA.toString()
          )
          // secondary input is the underlyings deposit
          trade.outputAmount = new TokenAmount(
            optionEntity.underlying,
            parsedAmountB.toString()
          )

          console.log(
            trade.option.address,
            trade.inputAmount.raw.toString(), // make sure this isnt amountADesired, amountADesired is the quantity for the internal function
            trade.outputAmount.raw.toString(),
            trade.option
              .proportionalShort(trade.inputAmount.raw.toString())
              .toString(),
            tradeSettings.deadline
          )
          transaction = SushiSwap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.ADD_LIQUIDITY_CUSTOM:
          tradeSettings.slippage = '0.01'
          // primary input is the options deposit (underlying tokens)
          trade.inputAmount = new TokenAmount(
            optionEntity.redeem,
            parsedAmountA.toString()
          )
          // secondary input is the underlyings deposit
          trade.outputAmount = new TokenAmount(
            optionEntity.underlying,
            parsedAmountB.toString()
          )
          transaction = SushiSwap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.REMOVE_LIQUIDITY:
          tradeSettings.slippage = '0.01'
          trade.inputAmount = new TokenAmount(
            optionEntity.redeem,
            parsedAmountA.toString()
          )
          trade.outputAmount = new TokenAmount(
            optionEntity.underlying,
            parsedAmountB.toString()
          )
          transaction = SushiSwap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.REMOVE_LIQUIDITY_CLOSE:
          tradeSettings.slippage = '0.01'
          trade.inputAmount = new TokenAmount(
            optionEntity.redeem,
            parsedAmountA.toString()
          )
          trade.outputAmount = new TokenAmount(
            optionEntity.underlying,
            parsedAmountB.toString()
          )
          transaction = SushiSwap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        default:
          transaction = SushiSwap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
      }
      console.log(trade)
      dispatch(
        updateItem({
          item,
          orderType,
          loading: false,
          approved,
        })
      )
      removeItem()
      executeTransaction(signer, transaction)
        .then((tx) => {
          if (tx.hash) {
            addTransaction(
              {
                summary: {
                  type: Operation[operation].toString(),
                  option: item.entity,
                  amount: numeral(
                    parseInt(formatEther(parsedAmountA.toString()))
                  )
                    .format('0.00(a)')
                    .toString(),
                },
                hash: tx.hash,
                addedTime: now(),
                from: account,
              },
              operation
            )
          }
        })
        .catch((err) => {
          throwError(0, 'Order Error', `${err.message}`, '')
        })
    },
    [dispatch, account, addTransaction]
  )
}
