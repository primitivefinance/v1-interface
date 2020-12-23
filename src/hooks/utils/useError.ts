import React, { useState, useCallback } from 'react'

export const useError = () => {
  const [_, setError] = useState()

  return useCallback(
    (e) => {
      setError(() => {
        throw e
      })
    },
    [setError]
  )
}
