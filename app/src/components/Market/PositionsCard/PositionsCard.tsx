import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import useOrders from '@/hooks/useOrders'
import useOptions from '@/hooks/useOptions'
import usePositions from '@/hooks/usePositions'
import AddIcon from '@material-ui/icons/Add'
import { Token } from '@uniswap/sdk'
import { useWeb3React } from '@web3-react/core'

import { OrderItem } from '@/contexts/Order/types'
import { destructureOptionSymbol } from '@/lib/utils'

import Card from '@/components/Card'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import BetaBanner from '@/components/BetaBanner'
import Spacer from '@/components/Spacer'
import Button from '@/components/Button'
import EmptyTable from '../EmptyTable'
import FilledBar from '../FilledBar'
import LitContainer from '@/components/LitContainer'
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import TableCell from '@/components/TableCell'
import TableRow from '@/components/TableRow'
import Timer from '../Timer'
import { useBalance } from '@/hooks/data'
import { OrderItem as Item } from '@/contexts/Order/types'

export interface TokenProps {
  token: Token
  balance: any
}
export interface PositionsProp {
  asset: string
}
const Position: React.FC<TokenProps> = ({ token, balance }) => {
  return (
    <StyledPosition>
      <span>{token.name}</span>
      <span>{balance}</span>
    </StyledPosition>
  )
}
const PositionsCard: React.FC<PositionsProp> = ({ asset }) => {
  const { options, getOptions } = useOptions()
  const [positions, setPositions] = useState()
  const { item } = useOrders()
  const { library, chainId, account } = useWeb3React()
  /*
  useEffect(() => {
    let temp
    let it = 0
    for (let x = 0; x < options['calls'].length; x++) {
      if (options['calls'][x].address) {
        const token = new Token(chainId, options['calls'][x].address, 18)
        const { data } = useBalance(library, account, token, account, true)
        if (data) {
          temp[it] = { token: token, balance: data }
          it++
        }
      }
    }
    for (let y = 0; y < options['puts'].length; y++) {
      if (options['puts'][y].address) {
        const token = new Token(chainId, options['puts'][y].address, 18)
        const { data } = useBalance(library, account, token, account, true)
        if (data) {
          temp[it] = { token: token, balance: data }
          it++
        }
      }
    }
    setPositions(temp)
  }, [options, useBalance, account, setPositions, chainId]) */

  useEffect(() => {
    if (library) {
      getOptions(asset.toLowerCase())
    }
  }, [getOptions, library, asset])

  if (item.id) return null
  if (positions !== undefined) {
    return (
      <Card>
        <CardTitle>Your Positions</CardTitle>
        <CardContent>
          {positions.map((pos, i) => (
            <Position key={i} token={pos.token} balance={pos.balance} />
          ))}
        </CardContent>
      </Card>
    )
  }
  return (
    <>
      <BetaBanner isOpen={true} />
      <Spacer />
      <Card>
        <CardTitle>Your Positions</CardTitle>
        <CardContent>
          <StyledEmptyContent>
            <StyledEmptyIcon>
              <AddIcon />
            </StyledEmptyIcon>
            <StyledEmptyMessage>
              Click an option to open an position
            </StyledEmptyMessage>
          </StyledEmptyContent>
        </CardContent>
      </Card>
    </>
  )
}

const StyledPosition = styled.div`
  border: 1px solid ${(props) => props.theme.color.grey[400]};
  background: ${(props) => props.theme.color.black};
`

const StyledEmptyContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const StyledEmptyIcon = styled.div`
  align-items: center;
  border: 1px dashed ${(props) => props.theme.color.white};
  border-radius: 32px;
  color: ${(props) => props.theme.color.white};
  display: flex;
  height: 44px;
  justify-content: center;
  width: 44px;
`

const StyledEmptyMessage = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
  margin-top: ${(props) => props.theme.spacing[3]}px;
  text-align: center;
`

export default PositionsCard
