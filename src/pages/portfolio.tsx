import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import PageHeader from '@/components/PageHeader'

import Spacer from '@/components/Spacer'
import { Grid, Col, Row } from 'react-styled-flexboxgrid'
import Button from '@/components/Button'

const Reset = () => {
  const [apps, setApps] = useState({ sushi: true, dai: true, weth: true })
  return (
    <>
      <Spacer />
      <Spacer />
      <StyledTitle>Reset Approvals</StyledTitle>
      <Spacer />
      <Spacer />
      <Container>
        <StyledRow>
          <StyledSub>SUSHI</StyledSub>
          <Spacer />
          <Spacer />

          {apps.sushi ? (
            <Button>Reset Approval</Button>
          ) : (
            <Button disabled>Approval Reset!</Button>
          )}
        </StyledRow>
        <Spacer />

        <StyledRow>
          <StyledSub>DAI</StyledSub>
          <Spacer />
          <Spacer />

          {apps.dai ? (
            <Button>Reset Approval</Button>
          ) : (
            <Button disabled>Approval Reset!</Button>
          )}
        </StyledRow>
        <Spacer />

        <StyledRow>
          <StyledSub>WETH</StyledSub>
          <Spacer />
          <Spacer />

          {apps.weth ? (
            <Button>Reset Approval</Button>
          ) : (
            <Button disabled>Approval Reset!</Button>
          )}
        </StyledRow>
      </Container>
    </>
  )
}

const Container = styled.div`
  max-width: 1000px;
`

const StyledRow = styled(Row)`
  align-items: center;
  width: 20em;
  justify-content: space-between;
`

const StyledTitle = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: ${(props) => props.theme.color.white};
`
const StyledSub = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.color.white};
`
export default Reset
