import React, { useEffect } from 'react'
import { useRouter } from 'next/router'


const Index: React.FC = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/markets/')
  })

  return (
    <>
      <div>loading</div>
    </>
  )
} 

export default Index