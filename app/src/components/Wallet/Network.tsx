import React from 'react'
import styled from 'styled-components'

export interface NetworkProps {
  id: number
}

export const Network: React.FC<NetworkProps> = ({ id }) => {
  if (id === 3) {
    return (
      <StyledRopsten>
        <h4>Ropsten</h4>
      </StyledRopsten>
    )
  }
  if (id === 4) {
    return (
      <StyledRink>
        <h4>Rinkeby</h4>
      </StyledRink>
    )
  }
  return null
}

const StyledRink = styled.div`
  align-items: center;
  color: ${(props) => props.theme.color.orange[500]};
`
const StyledRopsten = styled.div`
  align-items: center;
  color: ${(props) => props.theme.color.red[300]};
`
