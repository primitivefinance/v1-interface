import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'

import { removeItem, updateItem } from './actions'

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import ethers, { BigNumberish, BigNumber } from 'ethers'
import numeral from 'numeral'
import { Token, TokenAmount, Pair, JSBI, BigintIsh } from '@uniswap/sdk'
import { OptionsAttributes } from '../options/reducer'
import {
  DEFAULT_DEADLINE,
  DEFAULT_TIMELIMIT,
  STABLECOINS,
  DEFAULT_ALLOWANCE,
  ADDRESS_ZERO,
} from '@/constants/index'

import { UNISWAP_FACTORY_V2 } from '@/lib/constants'
import { UNISWAP_ROUTER02_V2 } from '@/lib/constants'
import { Option, createOptionEntityWithAddress } from '@/lib/entities/option'
import { parseEther, formatEther } from 'ethers/lib/utils'
import { Trade } from '@/lib/entities'
import { Trader } from '@/lib/trader'
import { Uniswap } from '@/lib/uniswap'
import { TradeSettings, SinglePositionParameters } from '@/lib/types'
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json'
import useTokenAllowance, {
  useGetTokenAllowance,
} from '@/hooks/useTokenAllowance'
import { Operation, UNISWAP_CONNECTOR, TRADER } from '@/constants/index'
import { useReserves } from '@/hooks/data'
import executeTransaction, {
  checkAllowance,
  executeApprove,
} from '@/lib/utils/executeTransaction'

import { useSlippage } from '@/hooks/user'
import { useBlockNumber } from '@/hooks/data'
import { useTransactionAdder } from '@/state/transactions/hooks'
import { useAddNotif } from '@/state/notifs/hooks'
import { useClearSwap } from '@/state/swap/hooks'
import { useClearLP } from '@/state/liquidity/hooks'

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
  lpPair?: Pair
) => void) => {
  const { chainId } = useWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const getAllowance = useGetTokenAllowance()
  const clear = useClearSwap()
  const clearLP = useClearLP()
  return useCallback(
    async (item: OptionsAttributes, orderType: Operation, lpPair?: Pair) => {
      const underlyingToken: Token = item.entity.underlying
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
      if (orderType === Operation.NONE) {
        clear()
        clearLP()
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
          const spender = UNISWAP_CONNECTOR[chainId]
          if (orderType === Operation.ADD_LIQUIDITY) {
            const tokenAllowance = await getAllowance(
              item.entity.tokenAddresses[0],
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
          if (orderType === Operation.REMOVE_LIQUIDITY_CLOSE && lpPair) {
            const lpToken = lpPair.liquidityToken.address
            const optionAllowance = await getAllowance(item.address, spender)
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
          let shortAddress
          switch (orderType) {
            case Operation.MINT:
              tokenAddress = underlyingToken.address
              break
            case Operation.EXERCISE:
              tokenAddress = item.entity.address
              shortAddress = item.entity.strike.address
              break
            case Operation.REDEEM:
              tokenAddress = item.entity.redeem.address
              break
            case Operation.CLOSE:
              tokenAddress = item.entity.address
              shortAddress = item.entity.redeem.address
              break
            default:
              break
          }
          const spender = TRADER[chainId]
          const tokenAllowance = await getAllowance(tokenAddress, spender)
          let shortAllowance = '0'
          if (shortAddress) {
            console.log(shortAddress)
            shortAllowance = await getAllowance(shortAddress, spender)
            console.log(shortAllowance.toString())
          }
          dispatch(
            updateItem({
              item,
              orderType,
              loading: false,
              approved: [
                parseEther(tokenAllowance).gt(parseEther('0')),
                parseEther(shortAllowance).gt(parseEther('0')),
              ],
            })
          )
          return
        } else {
          const spender =
            orderType === Operation.CLOSE_SHORT || orderType === Operation.SHORT
              ? UNISWAP_ROUTER02_V2
              : UNISWAP_CONNECTOR[chainId]
          let tokenAddress
          switch (orderType) {
            case Operation.LONG:
              tokenAddress = underlyingToken.address
              break
            case Operation.SHORT:
              tokenAddress = underlyingToken.address
              break
            case Operation.WRITE:
              tokenAddress = item.entity.address //underlyingToken.address FIX: double approval
              break
            case Operation.CLOSE_LONG:
              tokenAddress = item.entity.address
              break
            case Operation.CLOSE_SHORT:
              tokenAddress = item.entity.redeem.address
              break
            default:
              tokenAddress = underlyingToken.address
              break
          }
          const tokenAllowance = await getAllowance(tokenAddress, spender)
          dispatch(
            updateItem({
              item,
              orderType,
              loading: false,
              approved: [parseEther(tokenAllowance).gt(parseEther('0')), false],
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
  optionAddress: string,
  quantity: BigInt,
  operation: Operation,
  secondaryQuantity?: BigInt
) => void) => {
  const dispatch = useDispatch<AppDispatch>()
  const addTransaction = useTransactionAdder()
  const { item } = useItem()
  const { chainId, account } = useWeb3React()
  const [slippage] = useSlippage()
  const { data } = useBlockNumber()
  const throwError = useAddNotif()
  const now = () => new Date().getTime()

  return useCallback(
    async (
      provider: Web3Provider,
      optionAddress: string,
      quantity: BigInt,
      operation: Operation,
      secondaryQuantity?: BigInt
    ) => {
      const signer: ethers.Signer = await provider.getSigner()
      const tradeSettings: TradeSettings = {
        slippage: slippage,
        timeLimit: DEFAULT_TIMELIMIT,
        receiver: account,
        deadline: DEFAULT_DEADLINE,
        stablecoin: STABLECOINS[chainId].address,
      }
      console.log(tradeSettings)
      const optionEntity: Option = createOptionEntityWithAddress(
        chainId,
        optionAddress
      )

      //console.log(parseInt(quantity) * 1000000000000000000)
      const inputAmount: TokenAmount = new TokenAmount(
        EMPTY_TOKEN, // fix with actual metadata
        BigInt(quantity.toString()).toString()
      )
      const outputAmount: TokenAmount = new TokenAmount(
        EMPTY_TOKEN, // fix with actual metadata
        '0'
      )
      const optionInstance: ethers.Contract = optionEntity.optionInstance(
        signer
      )
      const base: ethers.BigNumber = await optionInstance.getBaseValue()
      const quote: ethers.BigNumber = await optionInstance.getQuoteValue()
      const tokenAddresses: string[] = await optionInstance.getAssetAddresses()
      optionEntity.setTokenAddresses(tokenAddresses)
      optionEntity.optionParameters.base = new TokenAmount(
        EMPTY_TOKEN,
        base.toString()
      )
      optionEntity.optionParameters.quote = new TokenAmount(
        EMPTY_TOKEN,
        quote.toString()
      )
      let out: BigNumberish
      const path: string[] = []
      const amountsIn: BigNumberish[] = []
      let amountsOut: BigNumberish[] = []
      const reserves: BigNumberish[] = []
      let totalSupply: BigNumberish
      const trade: Trade = new Trade(
        optionEntity,
        inputAmount,
        outputAmount,
        path,
        reserves,
        totalSupply,
        amountsIn,
        amountsOut,
        operation,
        signer
      )
      const factory = new ethers.Contract(
        UNISWAP_FACTORY_V2,
        UniswapV2Factory.abi,
        signer
      )
      // type SinglePositionParameters fails due to difference in Trader and Uniswap type
      let transaction: any
      switch (operation) {
        case Operation.LONG:
          // For this operation, the user borrows underlyingTokens to use to mint redeemTokens, which are then returned to the pair.
          // This is effectively a swap from redeemTokens to underlyingTokens, but it occurs in the reverse order.
          trade.path = [
            tokenAddresses[2], // redeem
            tokenAddresses[0], // underlying
          ]
          // The amountsOut[1] will tell us how much of the flash loan of underlyingTokens is outstanding.
          trade.amountsOut = await trade.getAmountsOut(
            signer,
            factory,
            inputAmount.raw.toString(),
            trade.path
          )
          // With the Pair's reserves, we can calculate all values using pure functions, including the premium.
          trade.reserves = await trade.getReserves(
            signer,
            factory,
            trade.path[0],
            trade.path[1]
          )
          transaction = Uniswap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.SHORT:
          // Going SHORT on an option effectively means holding the SHORT OPTION TOKENS.
          // Purchase them for underlyingTokens from the underlying<>redeem UniswapV2Pair.
          trade.path = [
            tokenAddresses[0], // underlying
            tokenAddresses[2], // redeem
          ]
          trade.reserves = await trade.getReserves(
            signer,
            factory,
            trade.path[0],
            trade.path[1]
          )
          amountsOut = await trade.getAmountsOut(
            signer,
            factory,
            trade.inputAmount.raw.toString(),
            trade.path
          )
          trade.outputAmount = new TokenAmount(
            EMPTY_TOKEN,
            amountsOut[1].toString()
          )
          transaction = Uniswap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.WRITE:
          trade.path = [
            tokenAddresses[0], // underlying
            tokenAddresses[2], // redeem
          ]
          // Get the reserves here because we have the web3 context. With the reserves, we can calulcate all token outputs.
          trade.reserves = await trade.getReserves(
            signer,
            factory,
            trade.path[0],
            trade.path[1]
          )
          transaction = Uniswap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.CLOSE_LONG:
          // On the UI, the user inputs the quantity of LONG OPTIONS they want to close.
          // Calling the function on the contract requires the quantity of SHORT OPTIONS being borrowed to close.
          // Need to calculate how many SHORT OPTIONS are needed to close the desired quantity of LONG OPTIONS.
          const redeemAmount = ethers.BigNumber.from(inputAmount.raw.toString())
            .mul(quote)
            .div(base)
          // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
          // with the path of underlyingTokens to redeemTokens.
          trade.path = [
            tokenAddresses[0], // underlying
            tokenAddresses[2], // redeem
          ]
          // The amountIn[0] will tell how many underlyingTokens are needed for the borrowed amount of redeemTokens.
          trade.amountsIn = await trade.getAmountsIn(
            signer,
            factory,
            redeemAmount,
            trade.path
          )
          // Get the reserves here because we have the web3 context. With the reserves, we can calulcate all token outputs.
          trade.reserves = await trade.getReserves(
            signer,
            factory,
            trade.path[0],
            trade.path[1]
          )
          // The actual function will take the redeemQuantity rather than the optionQuantity.
          trade.inputAmount = new TokenAmount(
            EMPTY_TOKEN,
            redeemAmount.toString()
          )
          transaction = Uniswap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.CLOSE_SHORT:
          // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
          // with the path of underlyingTokens to redeemTokens.
          trade.path = [
            tokenAddresses[2], // redeem
            tokenAddresses[0], // underlying
          ]
          // The amountIn[0] will tell how many underlyingTokens are needed for the borrowed amount of redeemTokens.
          trade.amountsOut = await trade.getAmountsOut(
            signer,
            factory,
            trade.inputAmount.raw.toString(),
            trade.path
          )
          // The actual function will take the redeemQuantity rather than the optionQuantity.
          trade.outputAmount = new TokenAmount(
            EMPTY_TOKEN,
            trade.amountsOut[1].toString()
          )
          transaction = Uniswap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.ADD_LIQUIDITY:
          // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
          // with the path of underlyingTokens to redeemTokens.
          trade.path = [
            tokenAddresses[2], // redeem
            tokenAddresses[0], // underlying
          ]
          // Get the reserves here because we have the web3 context. With the reserves, we can calulcate all token outputs.
          trade.reserves = await trade.getReserves(
            signer,
            factory,
            trade.path[0],
            trade.path[1]
          )
          // The actual function will take the redeemQuantity rather than the optionQuantity.
          out =
            secondaryQuantity !== BigInt('0')
              ? BigNumber.from(secondaryQuantity.toString())
              : BigNumber.from('0')

          console.log(out.toString())
          trade.outputAmount = new TokenAmount(
            EMPTY_TOKEN, // fix with actual metadata
            out.toString()
          )

          transaction = Uniswap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.ADD_LIQUIDITY_CUSTOM:
          // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
          // with the path of underlyingTokens to redeemTokens.
          trade.path = [
            tokenAddresses[2], // redeem
            tokenAddresses[0], // underlying
          ]
          // Get the reserves here because we have the web3 context. With the reserves, we can calulcate all token outputs.
          trade.reserves = await trade.getReserves(
            signer,
            factory,
            trade.path[0],
            trade.path[1]
          )
          // The actual function will take the redeemQuantity rather than the optionQuantity.
          out =
            secondaryQuantity !== BigInt('0')
              ? BigNumber.from(secondaryQuantity.toString())
              : BigNumber.from('0')

          trade.outputAmount = new TokenAmount(
            EMPTY_TOKEN, // fix with actual metadata
            out.toString()
          )

          transaction = Uniswap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          break
        case Operation.REMOVE_LIQUIDITY:
          trade.path = [
            tokenAddresses[2], // redeem
            tokenAddresses[0], // underlying
          ]
          // Get the reserves here because we have the web3 context. With the reserves, we can calulcate all token outputs.
          trade.reserves = await trade.getReserves(
            signer,
            factory,
            trade.path[0],
            trade.path[1]
          )
          trade.totalSupply = await trade.getTotalSupply(
            signer,
            factory,
            trade.path[0],
            trade.path[1]
          )
          transaction = Uniswap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          transaction.tokensToApprove = [
            await factory.getPair(trade.path[0], trade.path[1]),
          ] // need to approve LP token
          break
        case Operation.REMOVE_LIQUIDITY_CLOSE:
          trade.path = [
            tokenAddresses[2], // redeem
            tokenAddresses[0], // underlying
          ]
          // Get the reserves here because we have the web3 context. With the reserves, we can calulcate all token outputs.
          trade.reserves = await trade.getReserves(
            signer,
            factory,
            trade.path[0],
            trade.path[1]
          )
          trade.totalSupply = await trade.getTotalSupply(
            signer,
            factory,
            trade.path[0],
            trade.path[1]
          )
          transaction = Uniswap.singlePositionCallParameters(
            trade,
            tradeSettings
          )
          transaction.tokensToApprove = [
            await factory.getPair(trade.path[0], trade.path[1]),
            trade.option.address,
          ] // need to approve LP token
          break
        default:
          transaction = Trader.singleOperationCallParameters(
            trade,
            tradeSettings
          )
          break
      }
      console.log(trade)
      executeTransaction(signer, transaction)
        .then((tx) => {
          if (tx.hash) {
            addTransaction(
              {
                summary: {
                  type: Operation[operation].toString(),
                  option: item.entity,
                  amount: numeral(parseInt(formatEther(quantity.toString())))
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
