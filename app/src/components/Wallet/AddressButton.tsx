import React from 'react'
import styled from 'styled-components'

import CallMadeIcon from '@material-ui/icons/CallMade'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
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
  transaction?: boolean
  onClick: any
  selected?: boolean
}

export const AddressButton: React.FC<AddressButtonProps> = ({
  address,
  method,
  transaction,
  onClick,
  selected,
}) => {
  return (
    <>
      {Object.keys(WALLETS).map((key) => {
        const option = WALLETS[key]
        if (option.connector === method) {
          if (selected) {
            return (
              <StyledSelectedButton onClick={onClick}>
                <Box justifyContent="space-between" alignItems="center" row>
                  <h4>
                    {address.slice(0, 10)}...
                    {address.slice(address.length - 5, address.length)}
                  </h4>
                  <a
                    target="__blank"
                    href={`https://etherscan.io/address/${address}`}
                  >
                    {transaction !== null ? (
                      <CustomCallMadeIcon />
                    ) : transaction === false ? (
                      <Loader />
                    ) : (
                      <CheckCircleIcon color="inherit" />
                    )}
                  </a>
                </Box>
              </StyledSelectedButton>
            )
          }
          return (
            <StyledAddressButton onClick={onClick}>
              <Box justifyContent="space-between" alignItems="center" row>
                <h4>
                  {address.slice(0, 10)}...
                  {address.slice(address.length - 5, address.length)}
                </h4>
                <a
                  target="__blank"
                  href={`https://etherscan.io/address/${address}`}
                >
                  {transaction !== null ? (
                    <CustomCallMadeIcon />
                  ) : transaction === false ? (
                    <Loader />
                  ) : (
                    <CheckCircleIcon color="inherit" />
                  )}
                </a>
              </Box>
            </StyledAddressButton>
          )
        }
      })}
    </>
  )
}

const StyledAddressButton = styled.div`
  min-width: 12em;
  margin-bottom: 1em;
  margin-top: 1em;
  position: relative;
  padding-left: 0.5em;
  padding-right: 0.5em;
  cursor: pointer;
  background: black;
  color: grey;
  &:hover {
    color: white;
  }
`
const CustomCallMadeIcon = styled(CallMadeIcon)`
  color: grey;
  margin-top: 0.2em;
  &:hover {
    color: white;
  }
`
const StyledSelectedButton = styled.div`
  min-width: 12em;
  margin-top: 1em;
  margin-bottom: 1em;
  position: relative;
  padding-left: 0.5em;
  padding-right: 0.5em;
  cursor: pointer;
  background: black;
  color: white;
`
