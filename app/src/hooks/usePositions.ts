import { useContext } from 'react'

import { PositionsContext } from '../contexts/Positions-dep'

const usePositions = () => {
  return useContext(PositionsContext)
}

export default usePositions
