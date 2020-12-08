import ethers, { BigNumberish, Transaction } from 'ethers'
import { useCallback, useEffect, useState, useRef } from 'react'
import { Web3Provider } from '@ethersproject/providers'

import { Operation, UNISWAP_FACTORY_V2 } from '@/lib/constants'
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

const getTrade = async (
  provider: Web3Provider,
  optionAddress: string,
  quantity: number,
  operation: Operation,
  secondaryQuantity: number,
  tradeSettings: TradeSettings,
  optionEntity: Option
): Promise<
  Trade /* [Trade, (signer: ethers.Signer, transaction) => Promise<void>] */
> => {
  const signer: ethers.Signer = await provider.getSigner()

  const inputAmount: TokenAmount = new TokenAmount(
    EMPTY_ASSET, // fix with actual metadata
    parseEther(quantity.toString()).toString()
  )
  const outputAmount: TokenAmount = new TokenAmount(
    EMPTY_ASSET, // fix with actual metadata
    '0'
  )

  const base = optionEntity.baseValue.raw.toString()
  const quote = optionEntity.quoteValue.raw.toString()

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
        optionEntity.redeem.address, // redeem
        optionEntity.underlying.address, // underlying
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
      //transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.SHORT:
      // Going SHORT on an option effectively means holding the SHORT OPTION TOKENS.
      // Purchase them for underlyingTokens from the underlying<>redeem UniswapV2Pair.
      trade.path = [
        optionEntity.underlying.address, // underlying
        optionEntity.redeem.address, // redeem
      ]
      amountsOut = await trade.getAmountsOut(
        signer,
        factory,
        trade.inputAmount.raw.toString(),
        trade.path
      )
      trade.outputAmount = new TokenAmount(
        EMPTY_ASSET,
        amountsOut[1].toString()
      )
      //transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
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
        optionEntity.underlying.address, // underlying
        optionEntity.redeem.address, // redeem
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
      trade.inputAmount = new TokenAmount(EMPTY_ASSET, redeemAmount.toString())
      //transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.CLOSE_SHORT:
      // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
      // with the path of underlyingTokens to redeemTokens.
      trade.path = [
        optionEntity.redeem.address, // redeem
        optionEntity.underlying.address, // underlying
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
        EMPTY_ASSET,
        trade.amountsOut[1].toString()
      )
      //transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.ADD_LIQUIDITY:
      // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
      // with the path of underlyingTokens to redeemTokens.
      trade.path = [
        optionEntity.redeem.address, // redeem
        optionEntity.underlying.address, // underlying
      ]
      // Get the reserves here because we have the web3 context. With the reserves, we can calulcate all token outputs.
      trade.reserves = await trade.getReserves(
        signer,
        factory,
        trade.path[0],
        trade.path[1]
      )

      // The actual function will take the redeemQuantity rather than the optionQuantity.
      trade.outputAmount = new TokenAmount(
        EMPTY_ASSET, // fix with actual metadata
        parseEther(
          secondaryQuantity ? secondaryQuantity.toString() : '0'
        ).toString()
      )
      //transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.REMOVE_LIQUIDITY:
      // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
      // with the path of underlyingTokens to redeemTokens.
      trade.path = [
        optionEntity.redeem.address, // redeem
        optionEntity.underlying.address, // underlying
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
      //transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      //transaction.tokensToApprove = [
      //  await factory.getPair(trade.path[0], trade.path[1]),
      //] // need to approve LP token
      break
    case Operation.REMOVE_LIQUIDITY_CLOSE:
      // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
      // with the path of underlyingTokens to redeemTokens.
      trade.path = [
        optionEntity.redeem.address, // redeem
        optionEntity.underlying.address, // underlying
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
      //transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      //transaction.tokensToApprove = [
      //  await factory.getPair(trade.path[0], trade.path[1]),
      //] // need to approve LP token
      break
    default:
      //transaction = Trader.singleOperationCallParameters(trade, tradeSettings)
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
