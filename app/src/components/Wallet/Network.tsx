import React from 'react'
import styled from 'styled-components'

export interface NetworkProps {
  id: number
}

export const Network: React.FC<NetworkProps> = ({ id }) => {
  if (id === 3) {
    return (
      <StyledRopsten>
        <h5>Ropsten</h5>
      </StyledRopsten>
    )
  }
  if (id === 4) {
    return (
      <StyledRink>
        <h5>Rinkeby</h5>
      </StyledRink>
    )
  }
  return null
}

const StyledRink = styled.div`
  align-items: center;
  color: orange;
`
const StyledRopsten = styled.div`
  align-items: center;
  color: pink;
`
