import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import {
  NAME_FOR_CONTRACT,
  ADDRESS_FOR_CONTRACT,
  RECEIPT_FOR_CONTRACT,
  AUDIT_FOR_CONTRACT,
  CONTRACTS,
} from '@/constants/contracts'
import { ETHERSCAN_MAINNET } from '@/constants/index'
import { Grid, Col, Row } from 'react-styled-flexboxgrid'
import CheckIcon from '@material-ui/icons/Check'
import WarningIcon from '@material-ui/icons/Warning'
import IconButton from '@/components/IconButton'
import Button from '@/components/Button'
import Tooltip from '@/components/Tooltip'
import Box from '@/components/Box'
import Card from '@/components/Card'
import CardTitle from '@/components/CardTitle'
import CardContent from '@/components/CardContent'
import Spacer from '@/components/Spacer'

const Contracts: React.FC = () => {
  return (
    <>
      <StyledTitle>Deployed Contracts</StyledTitle>
      <Spacer />
      <Grid>
        <Row center="xs">
          {CONTRACTS.map((contract, i) => {
            return (
              <StyledCol sm={12} md={3} key={i}>
                <Card border>
                  <CardTitle>
                    <Box row justifyContent="flex-end" alignItems="center">
                      <StyledSub>{contract.name}</StyledSub>
                      <StyledLink
                        target="__none"
                        href={contract.audit !== 'N/A' ? contract.audit : null}
                      >
                        <IconButton variant="tertiary">
                          {contract.audit !== 'N/A' ? (
                            <Tooltip
                              icon={false}
                              text="This contract has been audited, click to view results"
                            >
                              <CheckIcon style={{ color: 'green' }} />
                            </Tooltip>
                          ) : (
                            <Tooltip
                              icon={false}
                              text="This contract is awaiting audit"
                            >
                              <WarningIcon style={{ color: 'yellow' }} />
                            </Tooltip>
                          )}
                        </IconButton>
                      </StyledLink>
                    </Box>
                  </CardTitle>
                  <div style={{ marginBottom: '-2em' }} />
                  <CardContent>
                    {contract.receipt?.dateConfirmed ? (
                      <Box row>{contract.receipt.dateConfirmed}</Box>
                    ) : null}

                    <Spacer />
                    <StyledLink
                      target="__none"
                      href={`${ETHERSCAN_MAINNET}/${contract.address}`}
                    >
                      <Button full variant="secondary">
                        View on Etherscan
                      </Button>
                    </StyledLink>
                  </CardContent>
                </Card>
                <Spacer />
              </StyledCol>
            )
          })}
        </Row>
      </Grid>
    </>
  )
}

const StyledLink = styled.a`
  color: white;
  text-decoration: none;
`
const StyledSub = styled.h4`
  color: white;
`
const StyledCol = styled(Col)`
  margin: 0.5em;
  overflow: visible;
`

const StyledTitle = styled.h2`
  color: white;
`
export default Contracts
