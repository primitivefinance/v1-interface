import React from 'react'
import styled from 'styled-components'
import EmptyTable from '../../EmptyTable'
import { headers } from '@/components/Market/OptionsTable/OptionsTableHeader'

const LoadingTable: React.FC = () => {
  return (
    <>
      <EmptyTable columns={headers} />
      <EmptyTable columns={headers} />
      <EmptyTable columns={headers} />
    </>
  )
}

export default LoadingTable
