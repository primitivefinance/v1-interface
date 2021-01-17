import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import PageHeader from '@/components/PageHeader'
import MarketCards from '@/components/MarketCards'
import Spacer from '@/components/Spacer'
import Box from '@/components/Box'
import LitContainer from '@/components/LitContainer'
import { createChart } from 'lightweight-charts'

export const Chart: React.FC = () => {
  const ref = useRef()
  const chart = createChart(ref.current, {
    width: 400,
    height: 300,
  })
  const lineSeries = chart.addLineSeries()
  lineSeries.setData([
    { time: '2019-04-11', value: 80.01 },
    { time: '2019-04-12', value: 96.63 },
    { time: '2019-04-13', value: 76.64 },
    { time: '2019-04-14', value: 81.89 },
    { time: '2019-04-15', value: 74.43 },
    { time: '2019-04-16', value: 80.01 },
    { time: '2019-04-17', value: 96.63 },
    { time: '2019-04-18', value: 76.64 },
    { time: '2019-04-19', value: 81.89 },
    { time: '2019-04-20', value: 74.43 },
  ])
  return (
    <Wrapper>
      <div ref={ref} />
      {chart.timeScale().fitContent()}
    </Wrapper>
  )
}
const Wrapper = styled.div`
  position: relative;
`
export default Chart
