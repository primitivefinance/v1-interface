import { createAction } from '@reduxjs/toolkit'
import { Option } from '@/lib/entities'
import { BigNumberish } from 'ethers'
import { ChainId } from '@uniswap/sdk'
import { PositionsState } from './reducer'

export const updatePositions = createAction<PositionsState>(
  'positions/updatePositions'
)
export const setLoading = createAction('positions/setLoading')
