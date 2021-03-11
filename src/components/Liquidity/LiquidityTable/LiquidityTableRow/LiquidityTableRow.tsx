import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import TableRow from '@/components/TableRow'
import TableCell from '@/components/TableCell'

import { BigNumber } from 'ethers'
import { parseEther, formatEther, parseUnits } from 'ethers/lib/utils'
import numeral from 'numeral'
import isZero from '@/utils/isZero'
import formatExpiry from '@/utils/formatExpiry'
import IconButton from '@/components/IconButton'
import Box from '@/components/Box'
import Switch from '@/components/Switch'
import Button from '@/components/Button'
import Separator from '@/components/Separator'
import Spacer from '@/components/Spacer'
import LineItem from '@/components/LineItem'

import { AddLiquidity } from '@/components/Market/OrderCard/components/AddLiquidity'
import { RemoveLiquidity } from '@/components/Market/OrderCard/components/RemoveLiquidity'

import { useWeb3React } from '@web3-react/core'
import { useItem, useUpdateItem, useRemoveItem } from '@/state/order/hooks'
import useBalance from '@/hooks/useBalance'
import useTokenBalance from '@/hooks/useTokenBalance'
import useTokenTotalSupply from '@/hooks/useTokenTotalSupply'
import { useClickAway } from '@/hooks/utils/useClickAway'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'

import { Option, SushiSwapMarket, Operation, Venue } from '@primitivefi/sdk'
import { Fraction, TokenAmount } from '@sushiswap/sdk'

const AddLiqButton: React.FC<any> = () => {
  const { item, orderType } = useItem()
  const updateItem = useUpdateItem()
  return (
    <>
      <Button
        variant={
          orderType === Operation.ADD_LIQUIDITY ? 'secondary' : 'default'
        }
        onClick={() => {
          if (orderType === Operation.ADD_LIQUIDITY) {
            updateItem(item, Operation.NONE)
          } else {
            updateItem(item, Operation.ADD_LIQUIDITY)
          }
        }}
      >
        {orderType === Operation.ADD_LIQUIDITY ? 'Close' : 'Add Liquidity'}
      </Button>
    </>
  )
}
const RemoveLiqButton: React.FC<any> = () => {
  const { item, orderType } = useItem()
  const updateItem = useUpdateItem()
  return (
    <>
      <Button
        variant={
          orderType === Operation.REMOVE_LIQUIDITY_CLOSE
            ? 'secondary'
            : 'default'
        }
        onClick={() => {
          if (orderType === Operation.REMOVE_LIQUIDITY_CLOSE) {
            updateItem(item, Operation.NONE)
          } else {
            updateItem(item, Operation.REMOVE_LIQUIDITY_CLOSE)
          }
        }}
      >
        {orderType === Operation.REMOVE_LIQUIDITY_CLOSE
          ? 'Close'
          : 'Remove Liquidity'}
      </Button>
    </>
  )
}
export interface TableColumns {
  key: string
  asset: string
  entity: Option
  market: SushiSwapMarket
  strike: string
  ask: string
  share: string
  asset1: string
  asset2: string
  fees: string
  liquidity: string[]
  expiry: number
  isCall: boolean
}

export interface LiquidityTableRowProps {
  onClick: () => void
  columns: TableColumns
  href?: string
}

const LiquidityTableRow: React.FC<LiquidityTableRowProps> = ({
  onClick,
  columns,
  href,
}) => {
  const {
    key,
    asset,
    entity,
    market,
    strike,
    ask,
    share,
    asset1,
    asset2,
    fees,
    liquidity,
    expiry,
    isCall,
  } = columns
  const [provide, setProvide] = useState(true)
  const [toggle, setToggle] = useState(false)
  const { item, orderType } = useItem()
  const lpToken = market ? market.liquidityToken.address : ''
  const token0 = market ? market.token0.symbol : ''
  const token1 = market ? market.token1.symbol : ''
  const underlyingTokenBalance = entity.isWethCall
    ? useBalance()
    : useTokenBalance(entity.underlying.address)
  const shortTokenBalance = useTokenBalance(entity.redeem.address)
  const lp = useTokenBalance(lpToken)
  const lpTotalSupply = useTokenTotalSupply(lpToken)

  const calculatePoolShare = useCallback(() => {
    const supply = BigNumber.from(parseEther(lpTotalSupply).toString())
    if (typeof market === 'undefined' || market === null || supply.isZero())
      return 0
    const tSupply = new TokenAmount(
      market.liquidityToken,
      parseEther(lpTotalSupply).toString()
    )

    const lpBal = new TokenAmount(
      market.liquidityToken,
      parseEther(lp).toString()
    )
    const poolShare = supply.gt(0)
      ? lpBal.divide(tSupply).multiply('100')
      : new Fraction('0')

    return poolShare.toSignificant(6)
  }, [market, lpTotalSupply, lp])

  const calculateLiquidityValuePerShare = useCallback(() => {
    if (
      typeof market === 'undefined' ||
      market === null ||
      BigNumber.from(parseEther(lpTotalSupply)).isZero()
    )
      return {
        shortPerLp: '0',
        underlyingPerLp: '0',
        totalUnderlyingPerLp: '0',
      }

    const shortValue = market.getLiquidityValue(
      entity.redeem,
      new TokenAmount(
        market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(market.liquidityToken, parseEther(lp).toString())
    )
    const underlyingValue = market.getLiquidityValue(
      entity.underlying,
      new TokenAmount(
        market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(market.liquidityToken, parseEther(lp).toString())
    )

    const totalUnderlyingValue = new TokenAmount(
      entity.underlying,
      BigNumber.from(shortValue.raw.toString())
        .mul(entity.baseValue.raw.toString())
        .div(entity.quoteValue.raw.toString())
        .add(underlyingValue.raw.toString())
        .toString()
    )

    const shortPerLp = shortValue.raw.toString()
    const underlyingPerLp = underlyingValue.raw.toString()
    const totalUnderlyingPerLp = totalUnderlyingValue.raw.toString()
    return { shortPerLp, underlyingPerLp, totalUnderlyingPerLp }
  }, [market, lp, lpTotalSupply])

  const calculateTotalLiquidity = useCallback(() => {
    if (
      typeof market === 'undefined' ||
      market === null ||
      BigNumber.from(parseEther(lpTotalSupply)).isZero()
    )
      return {
        shortPerLp: '0',
        underlyingPerLp: '0',
        totalUnderlyingPerLp: '0',
      }
    const shortValue = market.getLiquidityValue(
      entity.redeem,
      new TokenAmount(
        market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(
        market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      )
    )
    const underlyingValue = market.getLiquidityValue(
      entity.underlying,
      new TokenAmount(
        market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      ),
      new TokenAmount(
        market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      )
    )

    const totalUnderlyingValue = new TokenAmount(
      entity.underlying,
      BigNumber.from(shortValue.raw.toString())
        .mul(entity.baseValue.raw.toString())
        .div(entity.quoteValue.raw.toString())
        .add(underlyingValue.raw.toString())
        .toString()
    )

    const shortPerLp = shortValue.raw.toString()
    const underlyingPerLp = underlyingValue.raw.toString()
    const totalUnderlyingPerLp = totalUnderlyingValue.raw.toString()
    return { shortPerLp, underlyingPerLp, totalUnderlyingPerLp }
  }, [market, lpTotalSupply])

  const handleOnClick = useCallback(() => {
    //setProvide(true)
    setToggle(!toggle)
    console.log(toggle)
    onClick()
  }, [toggle, item])

  const handleOnAdd = (e) => {
    e.stopPropagation()
    onClick()
  }
  const nodeRef = useClickAway(() => {
    console.log(toggle)
    setToggle(!toggle)
    onClick()
  })

  const units = isCall ? asset.toUpperCase() : 'DAI'

  const assetSymbols = useCallback(() => {
    let asset1Symbol
    let asset2Symbol
    if (parseEther(asset1).gt(parseEther(asset2))) {
      asset1Symbol = 'SHORT'
      asset2Symbol = units
    } else {
      asset1Symbol = units
      asset2Symbol = 'SHORT'
    }

    return { asset1Symbol, asset2Symbol }
  }, [asset1, asset2, units])

  return (
    <StyledDiv>
      <TableRow
        isActive={
          item.entity === null || !toggle
            ? false
            : item?.entity.address === key
            ? true
            : false
        }
        key={key}
        onClick={handleOnClick}
      >
        <Asset>
          {asset === 'SUSHI' ? (
            <>
              <img
                height="24"
                src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B3595068778DD592e39A122f4f5a5cF09C90fE2/logo.png"
                style={{ borderRadius: '50%' }}
                alt={'icon'}
              />
              <Spacer size="sm" />
              SUSHI
            </>
          ) : isCall ? (
            <>
              <img
                height="24"
                src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
                style={{ borderRadius: '50%' }}
                alt={'icon'}
              />
              <Spacer size="sm" />
              ETH
            </>
          ) : (
            <>
              <img
                height="24"
                src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
                style={{ borderRadius: '50%' }}
                alt={'icon'}
              />
              <Spacer size="sm" />
              DAI
            </>
          )}
        </Asset>
        {!isZero(parseEther(lpTotalSupply)) ? (
          <TableCell>
            <span>
              {numeral(
                formatEther(calculateTotalLiquidity().totalUnderlyingPerLp)
              ).format('0.00a')}{' '}
              <Units>{units}</Units>
            </span>
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}
        <TableCell>
          {!isZero(parseEther(lp)) ? (
            <span>
              {numeral(calculatePoolShare()).format('0.00')} <Units>%</Units>
            </span>
          ) : (
            <>{`-`}</>
          )}
        </TableCell>

        {parseFloat(
          formatEther(calculateLiquidityValuePerShare().totalUnderlyingPerLp)
        ) > 0 ? (
          <TableCell>
            <span>
              {numeral(
                formatEther(
                  calculateLiquidityValuePerShare().totalUnderlyingPerLp
                )
              ).format('0.00a')}{' '}
              <Units>{units}</Units>
            </span>
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}

        <TableCell>{isCall ? asset : entity.strike.symbol}</TableCell>

        {expiry ? (
          <TableCell>
            <span>{formatExpiry(expiry).utc.substr(4, 12)}</span>
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}
        <TableCell>
          <span>
            {numeral(strike).format(+strike >= 10 ? '0.0a' : '0.00')}{' '}
            <Units>DAI</Units>
          </span>
        </TableCell>
        <TableCell key={'Open'}>
          <Box row justifyContent="center" alignItems="center">
            <span></span>
            <Spacer />

            {item?.entity === null && toggle ? (
              <IconButton size="lg" variant="outlined">
                <ExpandMoreIcon />
              </IconButton>
            ) : item?.entity?.address === key && toggle ? (
              <IconButton size="lg">
                <ExpandLessIcon />
              </IconButton>
            ) : (
              <IconButton size="lg" variant="outlined">
                <ExpandMoreIcon />
              </IconButton>
            )}
          </Box>
        </TableCell>
      </TableRow>

      {toggle && item.entity?.address === key ? (
        <OrderTableRow>
          <OrderContainer
            row
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Choice>
              <StyledTitle>
                <LineItem
                  label={'Asset Balance'}
                  data={numeral(
                    parseEther(underlyingTokenBalance).gt(
                      parseUnits('1', 'gwei')
                    )
                      ? underlyingTokenBalance
                      : '0'
                  ).format('0.00')}
                  units={entity.isWethCall ? 'ETH' : asset}
                />
                <Spacer />
                <AddLiqButton />
              </StyledTitle>
              {orderType === Operation.ADD_LIQUIDITY ? (
                <>
                  <Spacer size="sm" />
                  <Separator />
                  <AddLiquidity />
                </>
              ) : null}
            </Choice>

            <Spacer />
            <Choice>
              <StyledTitle>
                <LineItem
                  label={'Liquidity Balance'}
                  data={numeral(
                    formatEther(
                      calculateLiquidityValuePerShare().totalUnderlyingPerLp
                    )
                  ).format('0.00a')}
                  units={entity.isWethCall ? 'ETH' : asset}
                />
                <Spacer />
                <RemoveLiqButton />
              </StyledTitle>
              {orderType === Operation.REMOVE_LIQUIDITY_CLOSE ? (
                <>
                  <Spacer size="sm" />
                  <Separator />
                  <RemoveLiquidity />
                </>
              ) : null}
            </Choice>
          </OrderContainer>
        </OrderTableRow>
      ) : (
        <></>
      )}
    </StyledDiv>
  )
}

const StyledInnerTitle = styled.div`
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
  font-weight: 700;
  display: flex;
  flex: 1;
  width: 100%;
  letter-spacing: 0.5px;
  height: 44px;
  align-items: center;
`

const Choice = styled.div`
  min-width: 33em;
  background-color: ${(props) => props.theme.color.black};
  padding: 1em;
  border-radius: 0.5em;
  box-shadow: 3px 3px 3px rgba(250, 250, 250, 0.05);
`

const Asset = styled.div`
  display: flex !important;
  flex-direction: row;
  min-width: 140px !important;
  align-items: center;
`

const OrderContainer = styled(Box)``

const StyledTitle = styled.div`
  align-items: center;
  flex-direction: row;
  color: ${(props) => props.theme.color.white};
  font-size: 18px;
  font-weight: 800;
  display: flex;
  letter-spacing: 0.5px;
  width: 30em;
  justify-content: space-between;
`
const StyledDiv = styled.div`
  width: 100%;
  position: relative;
`

const Units = styled.span`
  opacity: 0.66;
  font-size: 12px;
`

interface StyleProps {
  isHead?: boolean
  isActive?: boolean
}

const OrderTableRow = styled.div<StyleProps>`
  background-color: ${(props) => props.theme.color.grey[800]};
  border-bottom: 1px solid
    ${(props) =>
      props.isHead || props.isActive
        ? 'transparent'
        : props.theme.color.grey[700]};
  color: ${(props) =>
    props.isHead ? props.theme.color.grey[400] : props.theme.color.white};
  display: flex;
  margin-left: -${(props) => props.theme.spacing[4]}px;
  padding: ${(props) => props.theme.spacing[4]}px;
`

export default LiquidityTableRow
