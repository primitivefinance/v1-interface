import UniswapV2Router02Artifact from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import ERC20 from '@primitivefi/contracts/artifacts/ERC20.json'
import { ethers } from 'ethers'
import {
  Token,
  Fetcher,
  Trade,
  TokenAmount,
  TradeType,
  Route,
  Percent,
} from '@uniswap/sdk'
import { parseEther } from 'ethers/lib/utils'

const UNI_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const MIN_ALLOWANCE = parseEther('10000000')

const checkAllowance = async (signer, tokenAddress, spenderAddress) => {
  let token = new ethers.Contract(tokenAddress, ERC20.abi, signer)
  let owner = await signer.getAddress()
  let allowance = await token.allowance(owner, spenderAddress)
  if (allowance < MIN_ALLOWANCE) {
    await token.approve(spenderAddress, MIN_ALLOWANCE)
  }
}

const buy = async (signer, minQuantity, optionAddress, stablecoinAddress) => {
  /* 
        function swapTokensForExactTokens(
          uint amountOut,
          uint amountInMax,
          address[] calldata path,
          address to,
          uint deadline
        ) external returns (uint[] memory amounts);

    */

  await checkAllowance(signer, stablecoinAddress, UNI_ROUTER_ADDRESS)
  let router = new ethers.Contract(
    UNI_ROUTER_ADDRESS,
    UniswapV2Router02Artifact.abi,
    signer
  )
  let chain = await signer.getChainId()
  const OPTION = new Token(chain, optionAddress, 18)
  const STABLECOIN = new Token(chain, stablecoinAddress, 18)
  const pair = await Fetcher.fetchPairData(OPTION, STABLECOIN)
  const route = new Route([pair], STABLECOIN, OPTION)
  const amountOut = parseEther(minQuantity.toString()).toString()
  const trade = new Trade(
    route,
    new TokenAmount(OPTION, amountOut),
    TradeType.EXACT_OUTPUT
  )

  const slippage = new Percent('100', '10000')
  const amountInMax = trade.maximumAmountIn(slippage).raw.toString()
  const path = [STABLECOIN.address, OPTION.address]
  const to = await signer.getAddress()
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20

  let tx
  try {
    console.log('Submitting trade: ', {
      amountOut,
      amountInMax,
      path,
      to,
      deadline,
    })
    tx = await router.swapTokensForExactTokens(
      amountOut,
      amountInMax,
      path,
      to,
      deadline
    )
  } catch (err) {
    console.log('Swap tokens for exact tokens error:', err)
    return tx
  }

  return tx
}

const sell = async (signer, minQuantity, optionAddress, stablecoinAddress) => {
  /* 
        function swapTokensForExactTokens(
          uint amountOut,
          uint amountInMax,
          address[] calldata path,
          address to,
          uint deadline
        ) external returns (uint[] memory amounts);

    */

  await checkAllowance(signer, optionAddress, UNI_ROUTER_ADDRESS)
  let router = new ethers.Contract(
    UNI_ROUTER_ADDRESS,
    UniswapV2Router02Artifact.abi,
    signer
  )
  let chain = await signer.getChainId()
  const OPTION = new Token(chain, optionAddress, 18)
  const STABLECOIN = new Token(chain, stablecoinAddress, 18)
  const pair = await Fetcher.fetchPairData(OPTION, STABLECOIN)
  const route = new Route([pair], OPTION, STABLECOIN)
  const amountIn = parseEther(minQuantity).toString()
  const trade = new Trade(
    route,
    new TokenAmount(OPTION, amountIn),
    TradeType.EXACT_INPUT
  )

  const slippage = new Percent('100', '10000')
  const amountOutMin = trade.minimumAmountOut(slippage).raw.toString()
  const path = [OPTION.address, STABLECOIN.address]
  const to = await signer.getAddress()
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20

  let tx
  try {
    console.log('Submitting trade: ', {
      amountIn,
      amountOutMin,
      path,
      to,
      deadline,
    })
    tx = await router.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      path,
      to,
      deadline
    )
  } catch (err) {
    console.log('Swap exact tokens for tokens error:', err)
  }

  return tx
}

const addLiquidity = async (
  signer,
  quantity,
  optionAddress,
  stablecoinAddress
) => {
  /* 
        function addLiquidity(
          address tokenA,
          address tokenB,
          uint amountADesired,
          uint amountBDesired,
          uint amountAMin,
          uint amountBMin,
          address to,
          uint deadline
        ) external returns (uint amountA, uint amountB, uint liquidity);
    */

  // Get router instances
  let router = new ethers.Contract(
    UNI_ROUTER_ADDRESS,
    UniswapV2Router02Artifact.abi,
    signer
  )

  // Check allowances
  await checkAllowance(signer, stablecoinAddress, UNI_ROUTER_ADDRESS)
  await checkAllowance(signer, optionAddress, UNI_ROUTER_ADDRESS)

  /* const chain = await signer.getChainId();
    const OPTION = new Token(chain, optionAddress, 18);
    const STABLECOIN = new Token(chain, stablecoinAddress, 18);

    const pair = await Fetcher.fetchPairData(STABLECOIN, OPTION);
    const route = new Route([pair], STABLECOIN, OPTION);
    const midPrice = Number(route.midPrice.toSignificant(6));

    const unit = parseEther("1").toString();
    const tokenAmount = new TokenAmount(OPTION, unit);
    const trade = new Trade(route, tokenAmount, TradeType.EXACT_OUTPUT); */

  // Craft the trade parameters
  const tokenA = optionAddress
  const tokenB = stablecoinAddress
  let amountADesired
  let amountBDesired
  let amountAMin
  let amountBMin
  const to = await signer.getAddress()
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20

  let tx
  try {
    tx = await router.addLiquidity(
      tokenA,
      tokenB,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      to,
      deadline
    )
  } catch (err) {
    console.log('Error adding liquidity: ', err)
  }

  return tx
}

export { buy, sell, addLiquidity }
