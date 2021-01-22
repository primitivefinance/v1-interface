import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import styled from 'styled-components'
import Link from 'next/link'
import TableCell from '@/components/TableCell'
import TableBody from '@/components/TableBody'
import TableRow from '@/components/TableRow'
import Spacer from '@/components/Spacer'

import Loader from '../Loader'
import LockIcon from '@material-ui/icons/Lock'
import { useWeb3React } from '@web3-react/core'
import { MARKETS, Market } from '@/constants/index'

const headers = [
  {
    name: 'Asset',
  },
  {
    name: 'Catagory',
  },
]

interface MarketProps {
  lists: any
}
const MarketTable: React.FC<MarketProps> = ({ lists }) => {
  return (
    <TableBody>
      <StyledTableRow isHead>
        {headers.map((head, index) => {
          return <TableCell key={index}>{head.name}</TableCell>
        })}
      </StyledTableRow>
      {lists?.asset ? (
        lists.asset.tokens.map((token, index) => {
          return (
            <Link
              href={`/markets/${encodeURIComponent(
                token.symbol.toLowerCase()
              )}/calls`}
              key={index}
            >
              <TableRow>
                <TableCell>
                  <Asset>
                    {token.logoURI !== '' ? (
                      <img
                        height="32"
                        src={token.logoURI}
                        style={{ borderRadius: '50%' }}
                        alt={'icon'}
                      />
                    ) : (
                      <></>
                    )}
                    <Spacer />
                    {token.name}
                  </Asset>
                </TableCell>
                <TableCell>Crypto Asset</TableCell>
              </TableRow>
            </Link>
          )
        })
      ) : (
        <TableRow isHead>
          <Loader />
        </TableRow>
      )}
      {lists.defi ? (
        lists.defi.tokens.map((token, index) => {
          return (
            <Link
              href={`/markets/${encodeURIComponent(
                token.symbol.toLowerCase()
              )}/calls`}
              key={index}
            >
              <TableRow>
                <TableCell>
                  <Asset>
                    {token.logoURI !== '' ? (
                      <img
                        height="32"
                        src={token.logoURI}
                        style={{ borderRadius: '50%' }}
                        alt={'icon'}
                      />
                    ) : (
                      <></>
                    )}
                    <Spacer />
                    {token.name}
                  </Asset>
                </TableCell>
                <TableCell>DeFi Token</TableCell>
              </TableRow>
            </Link>
          )
        })
      ) : (
        <TableRow isHead>
          <Loader />
        </TableRow>
      )}
    </TableBody>
  )
}

const Asset = styled.div`
  display: flex;
  min-width: 150px;
  align-items: center;
`
const StyledTableRow = styled(TableRow)`
  display: flex;
  align-items: center;
`

export default MarketTable
