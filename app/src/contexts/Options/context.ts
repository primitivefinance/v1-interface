import { createContext } from 'react'

import { OptionsContextValues, EmptyAttributes } from './types'

const OptionsContext = createContext<OptionsContextValues>({
  options: {
    calls: [EmptyAttributes],
    puts: [EmptyAttributes],
    reservesTotal: 0,
  },
  getOptions: (assetName: string) => {},
})

export default OptionsContext
