import { createContext } from 'react'

import { PositionsContextValues } from './types'

const PositionsContext = createContext<PositionsContextValues>({
  position: {
    loading: true,
    long: '',
    short: '',
    LP: '',
  },
  getPosition: (optionAddress: string) => {},
})

export default PositionsContext
