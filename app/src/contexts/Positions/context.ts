import { createContext } from 'react'
import { OptionsAttributes } from '../Options/types'

import { PositionsContextValues, EmptyPositionAttributes } from './types'

const PositionsContext = createContext<PositionsContextValues>({
  positions: {
    loading: true,
    exists: false,
    options: [EmptyPositionAttributes],
  },
  getPositions: (options: OptionsAttributes[]) => {},
})

export default PositionsContext
