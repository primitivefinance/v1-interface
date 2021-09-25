import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import LineItem from '@/components/LineItem'
import Spacer from '@/components/Spacer'
import Slider from '@/components/Slider'

import { BigNumber } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'
import { useAddNotif } from '@/state/notifs/hooks'

import useApprove from '@/hooks/transactions/useApprove'

import useGetPair from '@/hooks/useGetPair'
import useTokenBalance from '@/hooks/useTokenBalance'
import useTokenTotalSupply from '@/hooks/useTokenTotalSupply'
import { useBlockNumber } from '@/hooks/data/useBlockNumber'

import { PRIMITIVE_ROUTER, SignitureData, TRADER } from '@primitivefi/sdk'

import {
  useItem,
  useUpdateItem,
  useHandleSubmitOrder,
} from '@/state/order/hooks'

import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount, JSBI, ChainId } from '@sushiswap/sdk'
import numeral from 'numeral'
import { useLiquidityActionHandlers, useLP } from '@/state/liquidity/hooks'
import { tryParseAmount } from '@/utils/index'
import { usePermit } from '@/hooks/transactions/usePermit'
import Downgrade from './Downgrade'

const RemoveLiquidity: React.FC = () => {
  // executes transactions

  return (
    <LiquidityContainer>
      <Spacer />
      <Downgrade />
    </LiquidityContainer>
  )
}

const LiquidityContainer = styled.div`
  width: 100%;
`
export default RemoveLiquidity
