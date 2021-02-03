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
    tip: 'The total amount of tokens in the pool.',
  },
  {
    name: 'Your Share',
    tip: 'The proportion of ownership of the option pair.',
  },
  {
    name: 'Your Liquidity',
    tip: 'Your quantity of tokens in the pool.',
  },
  {
    name: 'Market',
    tip: 'The option market the pool serves.',
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
