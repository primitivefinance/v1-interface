import React, { useCallback, useState } from 'react'
import ErrorContext from './context'

const Error: React.FC = (props) => {
  const [error, setError] = useState({ exists: false, msg: '', link: null })

  const handleThrowError = useCallback(
    (msg: string, link: string) => {
      setError({ exists: true, msg: msg, link: link })
    },
    [error, setError]
  )
  const handleClearError = useCallback(() => {
    setError({ exists: false, msg: '', link: null })
  }, [setError])

  return (
    <ErrorContext.Provider
      value={{
        error: error.exists,
        msg: error.msg,
        link: error?.link,
        throwError: handleThrowError,
        clearError: handleClearError,
      }}
    >
      {props.children}
    </ErrorContext.Provider>
  )
}

export default Error
