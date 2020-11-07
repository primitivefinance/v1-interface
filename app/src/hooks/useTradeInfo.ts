import ethers, { BigNumberish } from 'ethers'
import { useCallback, useEffect, useState, useRef } from 'react'
import { Web3Provider } from '@ethersproject/providers'

import { Operation, UNISWAP_FACTORY_V2 } from '@/lib/constants'
import { Option } from '@/lib/entities/option'
import { parseEther } from 'ethers/lib/utils'
import { Asset, Trade, Quantity } from '@/lib/entities'
import { Uniswap, Trader, Protocol } from '@/lib/index'
import { TradeSettings } from '@/lib/types'
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json'
import { useTradeSettings } from '@/hooks/user'
import useTransactions from '@/hooks/transactions'

import executeTransaction from '@/lib/utils/executeTransaction'
import useOptionEntities, { OptionEntities } from '@/hooks/useOptionEntities'
import { addTransaction } from '@/contexts/Transactions/reducer'
import { useWeb3React } from '@web3-react/core'
import useOrders from '@/hooks/useOrders'

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

  const inputAmount: Quantity = new Quantity(
    new Asset(18), // fix with actual metadata
    parseEther(quantity.toString())
  )
  const outputAmount: Quantity = new Quantity(
    new Asset(18), // fix with actual metadata
    '0'
  )

  const base = optionEntity.optionParameters.base.quantity
  const quote = optionEntity.optionParameters.quote.quantity

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
        optionEntity.assetAddresses[2], // redeem
        optionEntity.assetAddresses[0], // underlying
      ]
      // The amountsOut[1] will tell us how much of the flash loan of underlyingTokens is outstanding.
      trade.amountsOut = await trade.getAmountsOut(
        signer,
        factory,
        inputAmount.quantity,
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
        optionEntity.assetAddresses[0], // underlying
        optionEntity.assetAddresses[2], // redeem
      ]
      amountsOut = await trade.getAmountsOut(
        signer,
        factory,
        trade.inputAmount.quantity,
        trade.path
      )
      trade.outputAmount.quantity = amountsOut[1]
      //transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.CLOSE_LONG:
      // On the UI, the user inputs the quantity of LONG OPTIONS they want to close.
      // Calling the function on the contract requires the quantity of SHORT OPTIONS being borrowed to close.
      // Need to calculate how many SHORT OPTIONS are needed to close the desired quantity of LONG OPTIONS.
      const redeemAmount = ethers.BigNumber.from(inputAmount.quantity)
        .mul(quote)
        .div(base)
      // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
      // with the path of underlyingTokens to redeemTokens.
      trade.path = [
        optionEntity.assetAddresses[0], // underlying
        optionEntity.assetAddresses[2], // redeem
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
      trade.inputAmount.quantity = redeemAmount
      //transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.CLOSE_SHORT:
      // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
      // with the path of underlyingTokens to redeemTokens.
      trade.path = [
        optionEntity.assetAddresses[2], // redeem
        optionEntity.assetAddresses[0], // underlying
      ]
      // The amountIn[0] will tell how many underlyingTokens are needed for the borrowed amount of redeemTokens.
      trade.amountsOut = await trade.getAmountsOut(
        signer,
        factory,
        trade.inputAmount.quantity,
        trade.path
      )
      // The actual function will take the redeemQuantity rather than the optionQuantity.
      trade.outputAmount.quantity = trade.amountsOut[1]
      //transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.ADD_LIQUIDITY:
      // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
      // with the path of underlyingTokens to redeemTokens.
      trade.path = [
        optionEntity.assetAddresses[2], // redeem
        optionEntity.assetAddresses[0], // underlying
      ]
      // Get the reserves here because we have the web3 context. With the reserves, we can calulcate all token outputs.
      trade.reserves = await trade.getReserves(
        signer,
        factory,
        trade.path[0],
        trade.path[1]
      )

      // The actual function will take the redeemQuantity rather than the optionQuantity.
      trade.outputAmount = new Quantity(
        new Asset(18), // fix with actual metadata
        parseEther(secondaryQuantity ? secondaryQuantity.toString() : '0')
      )
      //transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
      break
    case Operation.REMOVE_LIQUIDITY:
      // This function borrows redeem tokens and pays back in underlying tokens. This is a normal swap
      // with the path of underlyingTokens to redeemTokens.
      trade.path = [
        optionEntity.assetAddresses[2], // redeem
        optionEntity.assetAddresses[0], // underlying
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
        optionEntity.assetAddresses[2], // redeem
        optionEntity.assetAddresses[0], // underlying
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

const useTradeInfo = () => {
  const [trade, setTrade] = useState<Trade>()
  const { library } = useWeb3React()
  const { item, orderType } = useOrders()
  const optionEntities = useOptionEntities([item.address])
  const tradeSettings = useTradeSettings()

  const fetchTrade = useCallback(async () => {
    if (
      library &&
      typeof optionEntities !== 'undefined' &&
      item &&
      orderType &&
      tradeSettings
    ) {
      const tradeInfo = await getTrade(
        library,
        item.address,
        1,
        orderType,
        1,
        tradeSettings,
        optionEntities[item.address]
      )
      if (tradeInfo) {
        setTrade(tradeInfo)
      }
    }
  }, [library, orderType, item, tradeSettings, optionEntities, getTrade])

  useEffect(() => {
    if (
      library &&
      typeof optionEntities !== 'undefined' &&
      item &&
      orderType &&
      tradeSettings
    ) {
      fetchTrade()
      const refreshInterval = setInterval(fetchTrade, 10000000000)
      return () => clearInterval(refreshInterval)
    }
  }, [library, orderType, setTrade, item, tradeSettings, fetchTrade])

  return trade
}

export default useTradeInfo
