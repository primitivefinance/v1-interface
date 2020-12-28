import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Spacer from '@/components/Spacer'
import Link from 'next/link'

const Error: React.FC = () => {
  const router = useRouter()

  const handleClick = () => {
    router.push('/markets')
  }
  return (
    <>
      <Spacer />
      <Spacer />
      <StyledTitle>500 Error</StyledTitle>
    </>
  )
}

const StyledTitle = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: ${(props) => props.theme.color.red[500]};
`
const StyledSub = styled.a`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.color.grey[400]};
`

export default Error
