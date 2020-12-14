import ethers, { BigNumberish, Transaction } from 'ethers'
import { useCallback, useEffect, useState, useRef } from 'react'
import { Web3Provider } from '@ethersproject/providers'

import {
  Operation,
  DEFAULT_DEADLINE,
  DEFAULT_TIMELIMIT,
  STABLECOINS,
  ADDRESS_ZERO,
} from '@/constants/index'
import { UNISWAP_FACTORY_V2 } from '@/lib/constants'
import { Option, EMPTY_ASSET } from '@/lib/entities/option'
import { parseEther } from 'ethers/lib/utils'
import { Trade } from '@/lib/entities'
import { Uniswap, Trader, Protocol } from '@/lib/index'
import { SinglePositionParameters, TradeSettings } from '@/lib/types'
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json'
import { useTradeSettings } from '@/hooks/user'
import { Token, TokenAmount } from '@uniswap/sdk'

import executeTransaction from '@/lib/utils/executeTransaction'
import useOptionEntities, { OptionEntities } from '@/hooks/useOptionEntities'
import { useWeb3React } from '@web3-react/core'
import { useSlippage } from '@/hooks/user'
import { useBlockNumber } from '@/hooks/data'
import { useAddNotif } from '@/state/notifs/hooks'
import { getTotalSupply } from '@/lib/erc20'
import { useItem } from '@/state/order/hooks'

const EMPTY_TOKEN: Token = new Token(1, ADDRESS_ZERO, 18)

const getTrade = async (
  provider: Web3Provider,
  parsedAmountA: BigInt,
  operation: Operation,
  parsedAmountB?: BigInt
) => {
  const { item } = useItem()
  const { chainId, account } = useWeb3React()
  const [slippage] = useSlippage()
  const { data } = useBlockNumber()
  const throwError = useAddNotif()
  const now = () => new Date().getTime()
  const optionEntity: Option = item.entity
  const signer: ethers.Signer = await provider.getSigner()
  const tradeSettings: TradeSettings = {
    slippage: slippage,
    timeLimit: DEFAULT_TIMELIMIT,
    receiver: account,
    deadline: DEFAULT_DEADLINE,
    stablecoin: STABLECOINS[chainId].address,
  }

  let totalSupply: BigNumberish = await getTotalSupply(
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
  let amountsOut: BigNumberish[] = []
  const reserves: BigNumberish[] = []

  const trade: Trade = new Trade(
    optionEntity,
    item.market,
    totalSupply,
    inputAmount,
    outputAmount,
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
      // Need to borrow exact amount of underlyingTokens, so exact output needs to be the parsedAmount.
      // path: redeem -> underlying, getInputAmount is the redeem cost
      trade.inputAmount = new TokenAmount(optionEntity.redeem, '0')
      trade.outputAmount = new TokenAmount(
        optionEntity.underlying,
        parsedAmountA.toString()
      )
      transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
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
      transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.WRITE:
      // Path: underlying -> redeem, exact redeem amount is outputAmount.
      trade.outputAmount = new TokenAmount(
        optionEntity.redeem,
        optionEntity.proportionalShort(parsedAmountA.toString()).toString()
      )
      transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.CLOSE_LONG:
      // Path: underlying -> redeem, exact redeem amount is outputAmount.
      trade.outputAmount = new TokenAmount(
        optionEntity.redeem,
        optionEntity.proportionalShort(parsedAmountA.toString()).toString()
      )
      transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.CLOSE_SHORT:
      trade.inputAmount = new TokenAmount(
        optionEntity.redeem,
        parsedAmountA.toString()
      )
      trade.outputAmount = trade.market.getOutputAmount(trade.inputAmount)[0]

      transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.ADD_LIQUIDITY:
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

      transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.ADD_LIQUIDITY_CUSTOM:
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
      transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.REMOVE_LIQUIDITY:
      trade.inputAmount = new TokenAmount(
        optionEntity.redeem,
        parsedAmountA.toString()
      )
      trade.outputAmount = new TokenAmount(
        optionEntity.underlying,
        parsedAmountB.toString()
      )
      transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.REMOVE_LIQUIDITY_CLOSE:
      trade.inputAmount = new TokenAmount(
        optionEntity.redeem,
        parsedAmountA.toString()
      )
      trade.outputAmount = new TokenAmount(
        optionEntity.underlying,
        parsedAmountB.toString()
      )
      transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    default:
      transaction = Trader.singleOperationCallParameters(trade, tradeSettings)
      break
  }

  return trade
}

const useTradeExecution = (
  trade: Trade,
  tradeSettings: TradeSettings
): [
  SinglePositionParameters,
  (signer, transaction) => Promise<Transaction>
] => {
  const { library } = useWeb3React()
  const transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
  const handleExecution = useCallback(async (): Promise<Transaction> => {
    const tx = await executeTransaction(await library.getSigner(), transaction)
    return tx
  }, [executeTransaction, library, transaction, trade, tradeSettings])
  return [transaction, handleExecution]
}

export default useTradeExecution
