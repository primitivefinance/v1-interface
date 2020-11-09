import { useContext } from 'react'

import { ErrorContext } from '@/contexts/Error'

const useError = () => {
  return useContext(ErrorContext)
}

export default useError
