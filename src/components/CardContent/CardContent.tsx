import React from 'react'
import styled from 'styled-components'

const CardContent: React.FC = (props) => {
    return (
        <StyledCardContent>
            {props.children}
        </StyledCardContent>
    )
}

const StyledCardContent = styled.div`
    margin: ${props => props.theme.spacing[4]}px;
`

export default CardContent