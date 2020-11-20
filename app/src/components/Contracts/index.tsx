import React from 'react'
import styled from 'styled-components'
import {
  NAME_FOR_CONTRACT,
  ADDRESS_FOR_CONTRACT,
  RECEIPT_FOR_CONTRACT,
  AUDIT_FOR_CONTRACT,
  CONTRACTS,
} from '@/constants/contracts'
import { ETHERSCAN_MAINNET } from '@/constants/index'

import Button from '@/components/Button'
import Box from '@/components/Box'
import Card from '@/components/Card'
import CardTitle from '@/components/CardTitle'
import CardContent from '@/components/CardContent'
import Spacer from '@/components/Spacer'

const Contracts: React.FC = () => {
  return (
    <>
      <StyledTitle>Contracts</StyledTitle>
      <Box column alignItems="center" justifyContent="flex-start">
        {CONTRACTS.map((contract) => {
          return (
            <>
              <Card border>
                <CardTitle>{contract.name}</CardTitle>
                <CardContent>
                  {contract.receipt?.dateConfirmed ? (
                    <Box row>{contract.receipt.dateConfirmed}</Box>
                  ) : null}
                  <Box row justifyContent="space-between" alignItems="center">
                    <Button href={`${contract.audit}`} variant="secondary">
                      View Audit
                    </Button>
                    <Spacer />
                    <Button
                      href={`${ETHERSCAN_MAINNET}/${contract.address}`}
                      variant="secondary"
                    >
                      View on Etherscan
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              <Spacer />
            </>
          )
        })}
      </Box>
    </>
  )
}

const StyledTitle = styled.h2`
  color: white;
`
export default Contracts
