import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import GoBack from '@/components/GoBack'
import LitContainer from '@/components/LitContainer'
import Tooltip from '@/components/Tooltip'
import Spacer from '@/components/Spacer'
import Loader from '@/components/Loader'
import LaunchIcon from '@material-ui/icons/Launch'
import WarningIcon from '@material-ui/icons/Warning'

import useSWR from 'swr'
import { useOptions } from '@/state/options/hooks'
import { useUpdatePrice } from '@/state/price/hooks'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'

import formatBalance from '@/utils/formatBalance'
import formatEtherBalance from '@/utils/formatEtherBalance'
import numeral from 'numeral'

import {
  COINGECKO_ID_FOR_MARKET,
  NAME_FOR_MARKET,
  ADDRESS_FOR_MARKET,
  ETHERSCAN_MAINNET,
  ETHERSCAN_RINKEBY,
  getIconForMarket,
} from '@/constants/index'
import Link from 'next/link'

const formatName = (name: any) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export interface MarketHeaderProps {
  marketId: string
  isCall: number
}

const MarketHeader: React.FC<MarketHeaderProps> = ({ marketId, isCall }) => {
  const prevPrice = useRef<number | null>(null)
  const [blink, setBlink] = useState(false)
  const options = useOptions()
  const { library, chainId } = useWeb3React()
  const baseUrl = chainId === 1 ? ETHERSCAN_MAINNET : ETHERSCAN_RINKEBY

  const getMarketDetails = () => {
    const symbol: string = marketId
    const name: string = NAME_FOR_MARKET[marketId]
    const key: string = COINGECKO_ID_FOR_MARKET[marketId]
    const address: string = ADDRESS_FOR_MARKET[marketId]
    return { name, symbol, key, address }
  }

  const { name, symbol, key, address } = getMarketDetails()
  const { data, mutate } = useSWR(
    `https://api.coingecko.com/api/v3/simple/price?ids=${key}&vs_currencies=usd&include_24hr_change=true`
  )

  const updatePrice = useUpdatePrice()

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      updatePrice(data[key].usd)
      mutate()
    }, 1000)
    return () => clearInterval(refreshInterval)
  }, [blink, setBlink, name])

  useEffect(() => {
    if (data !== prevPrice.current) {
      setBlink(true)
    }
    prevPrice.current = data
  }, [blink, data, setBlink])

  useEffect(() => {
    const resetBlinkTimeout = setTimeout(() => {
      setBlink(false)
    }, 500)
    return () => clearTimeout(resetBlinkTimeout)
  }, [blink, setBlink])

  return (
    <StyledHeader>
      <GreyBack />
      <Spacer size="sm" />
      <Spacer size="sm" />
      <GoBack to="/markets" />
      <LitContainer>
        <Spacer size="sm" />
        <StyledTitle>
          <StyledLogo src={getIconForMarket(symbol)} alt={formatName(name)} />
          <Spacer />
          <StyledContent>
            <div style={{ marginTop: '.3em' }} />
            <StyledSymbol>{symbol.toUpperCase()}</StyledSymbol>
            <div style={{ marginTop: '.1em' }} />
            <StyledLink
              href={`${baseUrl}/${address}`}
              target="_blank"
              rel="noreferrer"
            >
              <StyledName>{formatName(name)}</StyledName>
              <StyledIcon />
            </StyledLink>
          </StyledContent>

          <Spacer size="md" />
          <StyledContent>
            <StyledSymbol>Price</StyledSymbol>
            <Spacer size="sm" />
            <StyledPrice size="sm" blink={blink}>
              {data ? (
                `$ ${formatBalance(data[key].usd)}`
              ) : (
                <Loader size="sm" />
              )}
            </StyledPrice>
          </StyledContent>

          <Spacer size="lg" />
          <StyledContent>
            <StyledSymbol>24hr Change</StyledSymbol>
            <Spacer size="sm" />
            <StyledPrice size="sm" blink={blink}>
              {data ? (
                `${formatBalance(data[key].usd_24h_change)}%`
              ) : (
                <Loader size="sm" />
              )}
            </StyledPrice>
          </StyledContent>

          <Spacer size="lg" />
          <StyledContent>
            <StyledSymbol>Total Liquidity</StyledSymbol>
            <StyledPrice size="sm">
              {!options.loading ? (
                formatEtherBalance(options.reservesTotal[isCall]) !== '0.00' ? (
                  <>
                    <div style={{ minHeight: '.4em' }} />

                    {`${numeral(
                      formatEtherBalance(options.reservesTotal[isCall])
                    ).format('0.00a')} ${' '} ${
                      isCall === 0 ? symbol.toUpperCase() : 'DAI'
                    }`}
                    <div style={{ minHeight: '.25em' }} />
                  </>
                ) : (
                  <>
                    <div style={{ minHeight: '.05em' }} />
                    <StyledL
                      row
                      justifyContent="flex-start"
                      alignItems="center"
                    >
                      <WarningIcon style={{ color: 'yellow' }} />
                      <Spacer size="sm" />
                      <h4>
                        <Tooltip
                          text={`This option market has no liquidty, click an option and navigate to the Liquidity tab to initalize trading.`}
                        >
                          N/A{' '}
                        </Tooltip>
                      </h4>
                    </StyledL>
                  </>
                )
              ) : (
                <>
                  <div style={{ minHeight: '.4em' }} />
                  <Loader size="sm" />
                  <div style={{ minHeight: '.4em' }} />
                </>
              )}
            </StyledPrice>
          </StyledContent>
        </StyledTitle>
      </LitContainer>
      <Reverse />
    </StyledHeader>
  )
}

const Reverse = styled.div`
  margin-bottom: -1em;
`

const StyledL = styled(Box)`
  margin-top: -1.5em;
  margin-bottom: -1.1em;
`

const GreyBack = styled.div`
  background: ${(props) => props.theme.color.grey[800]};
  position: absolute;
  z-index: -100;
  min-height: 310px;
  min-width: 1200px;
  left: 0;
`
const StyledContent = styled(Box)`
  align-items: baseline;
  flex-direction: row;
  justify-content: flex-start;
`
const StyledIcon = styled(LaunchIcon)`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 14px !important;
  margin-left: 10px;
`
const StyledHeader = styled.div`
  padding-bottom: ${(props) => props.theme.spacing[4]}px;
  margin-left: 2em;
`
const StyledLink = styled.a`
  text-decoration: none;
  color: ${(props) => props.theme.color.white};
  display: flex;
  flex-direction: row;
  align-items: center;
`
const StyledLoadingBlock = styled.div`
  background-color: ${(props) => props.theme.color.grey[400]};
  border-radius: 12px;
  height: 24px;
  width: 60px;
`
const StyledTitle = styled.div`
  align-items: center;
  flex-direction: row;
  color: ${(props) => props.theme.color.white};
  display: flex;
  margin-top: ${(props) => props.theme.spacing[2]}px;
`

const StyledName = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: ${(props) => props.theme.color.white};
  text-decoration: none;
  cursor: pointer;
  &:hover {
    color: ${(props) => props.theme.color.grey[400]};
  }
`

const StyledSymbol = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
  letter-spacing: 1px;
  text-transform: uppercase;
`
const StyledLogo = styled.img`
  border-radius: 50%;
  height: 64px;
`
interface StyledPriceProps {
  size?: 'sm' | 'md' | 'lg'
  blink?: boolean
}

const StyledPrice = styled.span<StyledPriceProps>`
  color: ${(props) => (props.blink ? '#00ff89' : props.theme.color.white)};
  font-size: ${(props) =>
    props.size === 'lg' ? 36 : props.size === 'sm' ? 18 : 24}px;
  font-weight: 700;
`

export default MarketHeader
