import React from 'react'
import CallMadeIcon from '@material-ui/icons/CallMade'
import styled from 'styled-components'

import Box from '@/components/Box'
import IconButton from '@/components/IconButton'
import CardIcon from '@/components/CardIcon'

import { WALLETS } from '../../constants'

export interface AccountProps {
  address: string
  method: any
}

export const Account = (props: AccountProps) => {
  const { address, method } = props
  return (
    <>
      {Object.keys(WALLETS).map((key) => {
        const option = WALLETS[key]
        if (option.connector === method) {
          return (
            <StyledAccount>
              <Box alignItems="flex-end" justifyContent="space-between">
                <h3>Connected to {option.name}</h3>
              </Box>
            </StyledAccount>
          )
        }
      })}
    </>
  )
}

const StyledAccount = styled.div`
  justify-content: center;
  margin-top: -1em;
`

const StyledLink = styled.a`
  text-decoration: none;
  color: white;
  cursor: pointer;
`
