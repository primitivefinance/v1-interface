import React from 'react'
import styled from 'styled-components'

import CallMadeIcon from '@material-ui/icons/CallMade'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import LaunchIcon from '@material-ui/icons/Launch'

import { WALLETS } from '../../constants'

import Box from '@/components/Box'
import IconButton from '@/components/IconButton'
import CardIcon from '@/components/CardIcon'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Spacer from '@/components/Spacer'

export interface AddressButtonProps {
  address: string
  method: any
  network: number
}

export const AddressButton: React.FC<AddressButtonProps> = ({
  address,
  method,
  network,
}) => {
  return (
    <>
      {Object.keys(WALLETS).map((key) => {
        const option = WALLETS[key]
        if (option.connector === method) {
          return (
            <a
              target="__blank"
              href={`https://etherscan.io/address/${address}`}
              style={{ textDecoration: 'none' }}
            >
              <StyledAddressButton>
                <Box row alignItems="center" justifyContent="space-between">
                  <StyledAddress>{address.slice(0, 12)}...</StyledAddress>
                  <LaunchIcon style={{ fontSize: '14px' }} />
                </Box>
              </StyledAddressButton>
            </a>
          )
        }
      })}
    </>
  )
}

const StyledAddress = styled.h4``

const StyledAddressButton = styled.div`
  background-color: ${(props) => props.theme.color.black};
  color: ${(props) => props.theme.color.grey[400]};
  cursor: pointer;
  min-width: 6em;
  position: relative;
  text-decoration: none;
  background: black;
  color: grey;
  height: 4em;
  margin-top: -0.1em;
  &:hover {
    color: ${(props) => props.theme.color.white};
  }
`
