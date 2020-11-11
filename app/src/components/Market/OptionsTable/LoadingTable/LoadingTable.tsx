import React from 'react'
import styled from 'styled-components'
import EmptyTable from '../../EmptyTable'

const LoadingTable: React.FC = () => {
  const headers = [
    {
      name: 'Strike Price',
      tip: 'The purchase price for the underlying asset of this option.',
    },
    {
      name: 'Break Even',
      tip:
        'The price the underlying asset must reach to reach a net cost of zero.',
    },
    {
      name: 'Price',
      tip:
        'The current spot price of an option token, not accounting for slippage.',
    },
    { name: '2% Depth', tip: '# of options can be bought at <2% slippage' },
    { name: 'Reserve', tip: 'The quantity of tokens in the pool.' },
    { name: 'Contract', tip: 'The address of the Option token.' },
    { name: '', tip: null },
  ]
  return (
    <>
      <EmptyTable columns={headers} />
      <EmptyTable columns={headers} />
      <EmptyTable columns={headers} />
    </>
  )
}

export default LoadingTable
