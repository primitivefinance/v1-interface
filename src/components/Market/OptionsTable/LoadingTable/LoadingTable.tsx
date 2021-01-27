import React from 'react'
import styled from 'styled-components'
import EmptyTable from '../../EmptyTable'
import { headers } from '@/components/Market/OptionsTable/OptionsTableHeader'

const alt = [
  {
    name: 'Asset',
    tip:
      'The asset to deposit into the pool, represents the underlying asset of the option market.',
  },
  {
    name: 'Pool Size',
    tip: 'The amount of underlying tokens in the pool.',
  },
  {
    name: 'Share',
    tip: 'The proportion of ownership of the option pair.',
  },

  {
    name: 'Pool Ratio',
    tip: 'The ratio of underlying tokens to short option tokens.',
  },
  {
    name: 'Price',
    tip: 'The ask price of 1 option token.',
  },
  { name: 'Expiry', tip: 'The maturity date of the option token.' },
  {
    name: 'Strike',
    tip: 'The purchase price for the underlying asset of this option.',
  },

  { name: '', tip: null },
]
interface LoadProp {
  ext?: boolean
}
const LoadingTable: React.FC<LoadProp> = ({ ext }) => {
  if (ext) {
    return (
      <>
        <EmptyTable columns={alt} />
        <EmptyTable columns={alt} />
        <EmptyTable columns={alt} />
      </>
    )
  }
  return (
    <>
      <EmptyTable columns={headers} />
      <EmptyTable columns={headers} />
      <EmptyTable columns={headers} />
    </>
  )
}

export default LoadingTable
