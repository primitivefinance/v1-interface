import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import TableRow from '@/components/TableRow'
import TableCell from '@/components/TableCell'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'
import numeral from 'numeral'
import isZero from '@/utils/isZero'
import formatExpiry from '@/utils/formatExpiry'
import IconButton from '@/components/IconButton'
import Box from '@/components/Box'
import Switch from '@/components/Switch'
import Spacer from '@/components/Spacer'
import Loader from '@/components/Loader'

import { AddLiquidity } from '@/components/Market/OrderCard/components/AddLiquidity'
import { RemoveLiquidity } from '@/components/Market/OrderCard/components/RemoveLiquidity'

import { useWeb3React } from '@web3-react/core'
import { useItem, useUpdateItem, useRemoveItem } from '@/state/order/hooks'
import useTokenBalance from '@/hooks/useTokenBalance'
import useTokenTotalSupply from '@/hooks/useTokenTotalSupply'
import { useClickAway } from '@/hooks/utils/useClickAway'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'

import { Option, Market, Operation } from '@primitivefi/sdk'
import { Fraction, TokenAmount } from '@uniswap/sdk'

export interface TableColumns {
  key: string
  asset: string
  entity: Option
  market: Market
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
  href: string
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
  const { item } = useItem()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()
  const { account, active, library } = useWeb3React()
  const lpToken = market ? market.liquidityToken.address : ''
  const token0 = market ? market.token0.symbol : ''
  const token1 = market ? market.token1.symbol : ''
  const underlyingTokenBalance = useTokenBalance(entity.underlying.address)
  const shortTokenBalance = useTokenBalance(entity.redeem.address)
  const lp = useTokenBalance(lpToken)
  const lpTotalSupply = useTokenTotalSupply(lpToken)
  /* useEffect(() => {
    if (provide && item) {
      updateItem(item, Operation.ADD_LIQUIDITY, market)
    } else if (item) {
      updateItem(item, Operation.REMOVE_LIQUIDITY_CLOSE, market)
    }
  }, [provide, item, updateItem]) */

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
    const poolShare = supply.gt(0) ? lpBal.divide(tSupply) : new Fraction('0')

    return poolShare.multiply('100').toSignificant(6)
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

    const [
      shortValue,
      underlyingValue,
      totalUnderlyingValue,
    ] = market.getLiquidityValuePerShare(
      new TokenAmount(
        market.liquidityToken,
        parseEther(lpTotalSupply).toString()
      )
    )
    const shortPerLp = parseEther(lp)
      .mul(shortValue.raw.toString())
      .div(parseEther('1'))
    const underlyingPerLp = parseEther(lp)
      .mul(underlyingValue.raw.toString())
      .div(parseEther('1'))
    const totalUnderlyingPerLp = parseEther(lp)
      .mul(totalUnderlyingValue.raw.toString())
      .div(parseEther('1'))
    return { shortPerLp, underlyingPerLp, totalUnderlyingPerLp }
  }, [market, lp, lpTotalSupply])

  const handleOnClick = useCallback(() => {
    //setProvide(true)
    setToggle(!toggle)

    onClick()
  }, [toggle, setToggle, item])
  const handleOnAdd = (e) => {
    e.stopPropagation()
    onClick()
  }
  const handlePause = () => {
    if (toggle) {
      setToggle(false)
      removeItem()
    } else {
      setToggle(true)
    }
  }
  const nodeRef = useClickAway(() => {
    setToggle(false)
    removeItem()
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
    <StyledDiv ref={nodeRef}>
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
        {parseFloat(liquidity[0]) > 0 ? (
          <TableCell>
            <span>
              {numeral(liquidity[0]).format('0.00a')} <Units>{units}</Units>
            </span>
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}
        <TableCell>
          {!isZero(parseEther(lp)) ? (
            <span>
              {numeral(calculatePoolShare()).format('0.00%')} <Units>%</Units>
            </span>
          ) : (
            <>{`-`}</>
          )}
        </TableCell>
        {!isZero(parseEther(asset1)) ? (
          <TableCell>
            <span>
              {numeral(
                formatEther(
                  entity.proportionalShort(
                    market.spotUnderlyingToShort.raw.toString()
                  )
                )
              ).format('(0.00)')}{' '}
            </span>
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}
        {!isZero(parseEther(ask)) ? (
          <TableCell>
            {isCall ? (
              <span>
                {numeral(formatEther(ask)).format('(0.000a)')}{' '}
                <Units>{units}</Units>
              </span>
            ) : (
              <span>
                {numeral(formatEther(ask)).format('(0.000a)')} <Units>$</Units>
              </span>
            )}
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}

        {expiry ? (
          <TableCell>
            <span>{formatExpiry(expiry).utc.substr(4, 12)}</span>
          </TableCell>
        ) : (
          <TableCell>-</TableCell>
        )}
        <TableCell>
          <span>
            {numeral(strike).format(+strike >= 1 ? '0' : '0.00')}{' '}
            <Units>DAI</Units>
          </span>
        </TableCell>
        <TableCell key={'Open'}>
          <Box row justifyContent="center" alignItems="center">
            <span></span>
            <Spacer />

            {item.entity === null ? (
              <IconButton size="lg" variant="outlined">
                <ExpandMoreIcon />
              </IconButton>
            ) : item.entity.address === key && toggle ? (
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
      {toggle && item.entity === null ? (
        <OrderTableRow onClick={handlePause} id="order-row">
          <OrderContainer>
            <Loader />
          </OrderContainer>
        </OrderTableRow>
      ) : null}
      {toggle && item.entity ? (
        <OrderTableRow onClick={handlePause} id="order-row">
          <OrderContainer>
            <StyledSwitch>
              <Switch
                active={provide}
                onClick={() => setProvide(!provide)}
                primaryText="Add"
                secondaryText="Remove"
              />
            </StyledSwitch>

            {provide ? <AddLiquidity /> : <RemoveLiquidity />}
          </OrderContainer>
        </OrderTableRow>
      ) : (
        <></>
      )}
    </StyledDiv>
  )
}

const OrderContainer = styled(Box)`
  flex-direction: column;
  flex: 1;
`

const Reverse = styled.div`
  margin-right: -2em;
`

const CustomButton = styled.div`
  margin-top: -0.1em;
  background: none;
`
const Separator = styled.div`
  border: 1px solid ${(props) => props.theme.color.grey[600]};
  width: 100%;
`

const StyledTitle = styled.div`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  font-size: 16px;
  font-weight: 700;
  display: flex;
  width: 100%;
  letter-spacing: 0.5px;
  justify-content: space-between;
`
const StyledDiv = styled.div`
  color: black;
`

const StyledButtonCell = styled.div`
  font-weight: inherit;
  justify-content: flex-start;
`

const Units = styled.span`
  opacity: 0.66;
  font-size: 12px;
`

interface StyleProps {
  isHead?: boolean
  isActive?: boolean
}

const StyledSwitch = styled.div`
  width: 66%;
`

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
