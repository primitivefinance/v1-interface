import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import GoBack from '@/components/GoBack'
import LitContainer from '@/components/LitContainer'
import Tooltip from '@/components/Tooltip'
import Spacer from '@/components/Spacer'
import Loader from '@/components/Loader'
import LaunchIcon from '@material-ui/icons/Launch'

import useSWR from 'swr'
import { useOptions } from '@/state/options/hooks'
import { useUpdatePrice } from '@/state/price/hooks'
import { useWeb3React } from '@web3-react/core'

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

const formatName = (name: any) => {
  if (name) {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
}

export interface MarketHeaderProps {
  marketId: string
  children?: any
}

const MarketHeader: React.FC<MarketHeaderProps> = ({ marketId, children }) => {
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
      mutate()
      updatePrice(data[key].usd)
    }, 2000)
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
      <Spacer />
      <LitContainer>
        <StyledTitle>
          <StyledLogo src={getIconForMarket(symbol)} alt={formatName(name)} />
          <div style={{ margin: '.5em' }} />
          <StyledContent>
            <div style={{ marginTop: '.3em' }} />
            <StyledSymbol>{symbol.toUpperCase()}</StyledSymbol>
            <div style={{ marginTop: '.5em' }} />
            <StyledLink
              href={`${baseUrl}/${address}`}
              target="_blank"
              rel="noreferrer"
            >
              <StyledName>
                {name === 'Wrapped ETH' ? 'WETH' : formatName(name)}{' '}
                <StyledIcon />
              </StyledName>
            </StyledLink>
            <div style={{ marginTop: '.3em' }} />
          </StyledContent>

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
          <Spacer />
          <StyledContent>
            <StyledSymbol>Venue</StyledSymbol>
            <Spacer size="sm" />
            <div style={{ marginTop: '-0.1em' }} />
            <Asset>
              <img
                height="24"
                src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B3595068778DD592e39A122f4f5a5cF09C90fE2/logo.png"
                style={{ borderRadius: '50%' }}
                alt={'icon'}
              />
              <Spacer size="sm" />
              SushiSwap
            </Asset>
            <div style={{ marginTop: '.3em' }} />
          </StyledContent>

          <Spacer size="sm" />
          {children}
        </StyledTitle>
      </LitContainer>
      <Reverse />
    </StyledHeader>
  )
}
const Reverse = styled.div`
  margin-bottom: -1em;
`

const Asset = styled.div`
  display: flex;
  min-width: 150px;
  align-items: center;
`

const StyledContent = styled(Box)`
  align-items: baseline;
  flex-direction: row;
  justify-content: flex-start;
  min-width: 8em;
  margin-right: 0em;
`
const StyledIcon = styled(LaunchIcon)`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 14px !important;
  margin-left: 10px;
`
const StyledHeader = styled.div`
  padding-bottom: ${(props) => props.theme.spacing[4]}px;
  margin-left: 2em;
  margin-right: 2em;
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
  justify-content: flex-start;
`

const StyledName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${(props) => props.theme.color.white};
  text-decoration: none;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 12em;
  &:hover {
    color: ${(props) => props.theme.color.grey[400]};
  }
`

const StyledSymbol = styled.span`
  color: ${(props) => props.theme.color.grey[400]};
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 14px;
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
