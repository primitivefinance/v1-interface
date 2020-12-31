import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Loader from '@/components/Loader'
const Index: React.FC = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/markets/')
  })

  return (
    <>
      <Loader />
    </>
  )
}

export default Index
