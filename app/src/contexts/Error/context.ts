import { createContext } from 'react'
import { ErrorContextValues } from './types'
const ErrorContext = createContext<ErrorContextValues>({
  error: false,
  msg: '',
  link: '',
  throwError: (msg: string, link?: string) => {},
  clearError: () => {},
})

export default ErrorContext
