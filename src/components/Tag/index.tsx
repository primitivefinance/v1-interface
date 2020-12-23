import React from 'react'
import styled from 'styled-components'

export interface TagProps {
  active: boolean
  text: string
}

const Tag: React.FC<TagProps> = ({ active, text }) => {
  return (
    <StyledTag active>
      <TagMessage>{text}</TagMessage>
    </StyledTag>
  )
}

interface StyledTagProps {
  active: boolean
}
const StyledTag = styled.div<StyledTagProps>`
  padding: 0.5em;
  border: 1px solid green;
  color: ${(props) => (props.active ? 'yellow' : 'red')};
`

const TagMessage = styled.h4``

export default Tag
