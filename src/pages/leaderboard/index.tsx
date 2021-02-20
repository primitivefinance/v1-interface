import React from 'react'
import styled from 'styled-components'

import Spacer from '@/components/Spacer'
import Title from '@/components/Title'
import LeaderboardTable from '@/components/LeaderboardTable'

const ADDRESSES = ['0x152Ac2bC1821C5C9ecA56D1F35D8b0D8b61187F5']

const LeaderBoard: React.FC = () => {
  return (
    <>
      <Title>Leaderboard</Title>
      <Spacer />
      <LeaderboardTable />
    </>
  )
}

export default LeaderBoard
