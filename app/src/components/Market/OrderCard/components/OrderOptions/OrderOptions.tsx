import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import ethers from 'ethers'
import { Pair, Token, TokenAmount, Trade, TradeType, Route } from '@uniswap/sdk'
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'

import Label from '@/components/Label'
import Button from '@/components/Button'
import Box from '@/components/Box'
import Spacer from '@/components/Spacer'
import useOrders from '@/hooks/useOrders'
import useTokenBalance from '@/hooks/useTokenBalance'
import usePositions from '@/hooks/usePositions'
import Option from '@primitivefi/contracts/artifacts/Option.json'

import LineItem from '@/components/LineItem'
import TableRow from '../../../../TableRow/TableRow'
import formatBalance from '@/utils/formatBalance'
import { useWeb3React } from '@web3-react/core'

const OrderOptions: React.FC = () => {
  const { item, onChangeItem } = useOrders()
  const { positions, getPositions } = usePositions()
  const { chainId, library } = useWeb3React()
  const [balanceAddress, setBalanceAddress] = useState({
    longT: '',
    shortT: '',
    longLP: '',
    shortLP: '',
  })

  useEffect(() => {
    const getAddresses = async () => {
      const stablecoinAddress = '0xb05cB19b19e09c4c7b72EA929C8CfA3187900Ad2'
      const tokenA = new Token(chainId, stablecoinAddress, 18)
      // long side
      const option = new ethers.Contract(item.address, Option.abi, library)
      const optionToken = new Token(chainId, item.address, 18)
      const longPair = Pair.getAddress(tokenA, optionToken)

      // short side
      const redeemAddress = await option.redeemToken()
      const redeem = new Token(chainId, redeemAddress, 18)
      const redeemPair = Pair.getAddress(tokenA, redeem)

      try {
        const longLPAddress = await new ethers.Contract(
          longPair,
          IUniswapV2Pair.abi,
          library
        ).liquidityToken
        const shortLPAddress = await new ethers.Contract(
          redeemPair,
          IUniswapV2Pair.abi,
          library
        ).liquidityToken
        return {
          longT: item.address,
          shortT: redeemAddress,
          longLP: longLPAddress,
          shortLP: shortLPAddress,
        }
      } catch (error) {
        console.error(error)
      }
    }

    getAddresses().then((add) => setBalanceAddress(add))
  }, [getPositions, positions, balanceAddress, setBalanceAddress])

  const longBalance = useTokenBalance(balanceAddress.longT)
  const shortBalance = useTokenBalance(balanceAddress.shortT)
  const longLPBalance = useTokenBalance(balanceAddress.longLP)
  const shortLPBalance = useTokenBalance(balanceAddress.shortLP)

  const change = (t: string) => {
    onChangeItem(item, t)
  }

  return (
    <>
      <Box row alignItems="flex-start" justifyContent="flex-start">
        <StyledColumn>
          <Box row justifyContent="flex-start" alignItems="center">
            <Label text={'Long Tokens'} />
            <StyledBalance>{formatBalance(longBalance)}</StyledBalance>
          </Box>
          <Button full size="sm" onClick={() => change('BUY')}>
            Open Long
          </Button>
          <Spacer size="sm" />
          <Button
            full
            size="sm"
            variant="secondary"
            onClick={() => change('BUY')}
          >
            Close Long
          </Button>
          <Spacer />
          <Box row justifyContent="flex-start" alignItems="center">
            <Label text={'Long LP Tokens'} />
            <StyledBalance>{formatBalance(longLPBalance)}</StyledBalance>
          </Box>
          <Spacer size="sm" />
          <Button size="sm" onClick={() => change('LP')}>
            Provide Liquidity
          </Button>
          <Spacer size="sm" />
          {!longLPBalance ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => change('W_LP')}
            >
              Withdraw Liquidity
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              Withdraw Liquidity
            </Button>
          )}
        </StyledColumn>
        <StyledColumn>
          <Box row justifyContent="flex-start" alignItems="center">
            <Label text={'Short Tokens'} />
            <StyledBalance>{formatBalance(shortBalance)}</StyledBalance>
          </Box>
          <Button full size="sm" onClick={() => change('BUY')}>
            Open Short
          </Button>
          <Spacer size="sm" />
          <Button
            full
            size="sm"
            variant="secondary"
            onClick={() => change('BUY')}
          >
            Close Short
          </Button>
          <Spacer />
          <Box row justifyContent="flex-start" alignItems="center">
            <Label text={'Short LP Tokens'} />
            <StyledBalance>{formatBalance(shortLPBalance)}</StyledBalance>
          </Box>
          <Spacer size="sm" />
          <Button size="sm" onClick={() => change('LP')}>
            Provide Liquidity
          </Button>
          <Spacer size="sm" />
          {!shortLPBalance ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => change('W_LP')}
            >
              Withdraw Liquidity
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              Withdraw Liquidity
            </Button>
          )}
        </StyledColumn>
        <Spacer />
      </Box>
    </>
  )
}

const StyledColumn = styled.div`
  display: flex;
  padding-left: 1em;
  padding-right: 1em;
  flex-direction: column;
  width: 42%;
`

const StyledBalance = styled.h5`
  color: ${(props) => props.theme.color.white};
  padding-left: 1em;
`

export default OrderOptions
