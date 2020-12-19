import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Spacer from '@/components/Spacer'
import Link from 'next/link'

const FAQ: React.FC = () => {
  const router = useRouter()
  useEffect(() => {
    setTimeout(() => {
      router.push('/markets')
    }, 1500)
  })
  return (
    <>
      <Spacer />
      <Spacer />
      <StyledTitle>404</StyledTitle>
      <StyledSub>Returning to market page...</StyledSub>
    </>
  )
}

const StyledTitle = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: ${(props) => props.theme.color.white};
`
const StyledSub = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.color.grey[400]};
`

export default FAQ
