import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'

import { removeItem, updateItem } from './actions'

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import ethers, { BigNumberish, BigNumber } from 'ethers'
import numeral from 'numeral'
import { Token, TokenAmount, Pair, JSBI, BigintIsh } from '@uniswap/sdk'
import * as SushiSwapSDK from '@sushiswap/sdk'
import { OptionsAttributes } from '../options/actions'
import {
  DEFAULT_DEADLINE,
  DEFAULT_TIMELIMIT,
  STABLECOINS,
  DEFAULT_ALLOWANCE,
  ADDRESS_ZERO,
} from '@/constants/index'

import { FACTORY_ADDRESS } from '@uniswap/sdk'
import { UNI_ROUTER_ADDRESS } from '@primitivefi/sdk'
import { Option, createOptionEntityWithAddress } from '@primitivefi/sdk'
import { parseEther, formatEther } from 'ethers/lib/utils'
import {
  Trade,
  Trader,
  Uniswap,
  Venue,
  SUSHISWAP_CONNECTOR,
  SUSHI_ROUTER_ADDRESS,
} from '@primitivefi/sdk'
import { TradeSettings, SinglePositionParameters } from '@primitivefi/sdk'
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json'
import useTokenAllowance, {
  useGetTokenAllowance,
} from '@/hooks/useTokenAllowance'
import { Operation, UNISWAP_CONNECTOR, TRADER } from '@/constants/index'
import { useReserves } from '@/hooks/data'
import executeTransaction from '@/utils/executeTransaction'

import { useSlippage } from '@/state/user/hooks'
import { useBlockNumber } from '@/hooks/data'
import { useTransactionAdder } from '@/state/transactions/hooks'
import { useAddNotif } from '@/state/notifs/hooks'
import { useClearSwap } from '@/state/swap/hooks'
import { useClearLP } from '@/state/liquidity/hooks'
import { getTotalSupply } from '@primitivefi/sdk'

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
  lpPair?: Pair | SushiSwapSDK.Pair
) => void) => {
  const { chainId } = useWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const getAllowance = useGetTokenAllowance()
  const clear = useClearSwap()
  const clearLP = useClearLP()
  return useCallback(
    async (
      item: OptionsAttributes,
      orderType: Operation,
      lpPair?: Pair | SushiSwapSDK.Pair
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
      clear()
      clearLP()
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
          orderType === Operation.REMOVE_LIQUIDITY_CLOSE
        ) {
          const spender =
            item.venue === Venue.UNISWAP
              ? UNISWAP_CONNECTOR[chainId]
              : SUSHISWAP_CONNECTOR[chainId]
          if (orderType === Operation.ADD_LIQUIDITY) {
            const tokenAllowance = await getAllowance(
              item.entity.underlying.address,
              spender
            )
            dispatch(
              updateItem({
                item,
                orderType,
                loading: false,
                approved: [
                  parseEther(tokenAllowance).gt(parseEther('0')),
                  false,
                ],
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
            dispatch(
              updateItem({
                item,
                orderType,
                loading: false,
                approved: [
                  parseEther(optionAllowance).gt(parseEther('0')),
                  parseEther(lpAllowance).gt(parseEther('0')),
                ],
              })
            )
            return
          }
        } else if (orderType === Operation.REMOVE_LIQUIDITY) {
          const spender =
            item.venue === Venue.UNISWAP
              ? UNI_ROUTER_ADDRESS
              : SUSHI_ROUTER_ADDRESS
          if (item.market) {
            const lpToken = item.market.liquidityToken.address
            const optionAllowance = await getAllowance(
              item.entity.address,
              spender
            )
            const lpAllowance = await getAllowance(lpToken, spender)
            dispatch(
              updateItem({
                item,
                orderType,
                loading: false,
                approved: [
                  parseEther(optionAllowance).gt(parseEther('0')),
                  parseEther(lpAllowance).gt(parseEther('0')),
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
          const spender = TRADER[chainId]
          const tokenAllowance = await getAllowance(tokenAddress, spender)
          let secondaryAllowance = '0'
          if (secondaryAddress) {
            secondaryAllowance = await getAllowance(secondaryAddress, spender)
          }
          dispatch(
            updateItem({
              item,
              orderType,
              loading: false,
              approved: [
                parseEther(tokenAllowance).gt(parseEther('0')),
                parseEther(secondaryAllowance).gt(parseEther('0')),
              ],
            })
          )
          return
        } else {
          const isUniswap = item.venue === Venue.UNISWAP ? true : false
          const spender =
            orderType === Operation.CLOSE_SHORT || orderType === Operation.SHORT
              ? isUniswap
                ? UNI_ROUTER_ADDRESS
                : SUSHI_ROUTER_ADDRESS
              : isUniswap
              ? UNISWAP_CONNECTOR[chainId]
              : SUSHISWAP_CONNECTOR[chainId]

          let tokenAddress
          let secondaryAddress
          switch (orderType) {
            case Operation.LONG:
              tokenAddress = item.entity.underlying.address
              break
            case Operation.SHORT:
              tokenAddress = item.entity.underlying.address
              break
            case Operation.WRITE:
              tokenAddress = item.entity.underlying.address
              secondaryAddress = item.entity.address
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
          dispatch(
            updateItem({
              item,
              orderType,
              loading: false,
              approved: [
                parseEther(tokenAllowance).gt(parseEther('0')),
                parseEther(secondaryAllowance).gt(parseEther('0')),
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

  return useCallback(() => {
    dispatch(removeItem())
  }, [dispatch])
}
export const useHandleSubmitOrder = (): ((
  provider: Web3Provider,
  parsedAmountA: BigInt,
  operation: Operation,
  parsedAmountB?: BigInt
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
      parsedAmountB?: BigInt
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
        timeLimit: DEFAULT_TIMELIMIT,
        receiver: account,
        deadline: DEFAULT_DEADLINE,
        stablecoin: STABLECOINS[chainId].address,
      }

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
        signer
      )
      const factory = new ethers.Contract(
        FACTORY_ADDRESS,
        UniswapV2Factory.abi,
        signer
      )
      // type SinglePositionParameters fails due to difference in Trader and Uniswap type
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
          transaction = Uniswap.singlePositionCallParameters(
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
          transaction = Uniswap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.WRITE:
          // Path: underlying -> redeem, exact redeem amount is outputAmount.
          trade.outputAmount = new TokenAmount(
            optionEntity.redeem,
            optionEntity.proportionalShort(parsedAmountA.toString()).toString()
          )
          transaction = Uniswap.singlePositionCallParameters(
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
          transaction = Uniswap.singlePositionCallParameters(
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

          transaction = Uniswap.singlePositionCallParameters(
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

          transaction = Uniswap.singlePositionCallParameters(
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
          transaction = Uniswap.singlePositionCallParameters(
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
          transaction = Uniswap.singlePositionCallParameters(
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
          transaction = Uniswap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        default:
          transaction = Trader.singleOperationCallParameters(
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
