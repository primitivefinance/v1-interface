import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import TableCell from '@/components/TableCell'
import TableBody from '@/components/TableBody'
import TableRow from '@/components/TableRow'
import Spacer from '@/components/Spacer'

import Loader from '../Loader'
import { useWeb3React } from '@web3-react/core'

const headers = [
  {
    name: 'Market',
  },
  {
    name: 'Category',
  },
]

interface MarketProps {
  lists: any
}
const MarketTable: React.FC<MarketProps> = ({ lists }) => {
  const { chainId } = useWeb3React()

  return (
    <TableBody>
      <StyledTableRow isHead>
        {headers.map((head, index) => {
          return <TableCell key={index}>{head.name}</TableCell>
        })}
      </StyledTableRow>
      <GreyBack />
      {lists?.asset ? (
        lists.asset.tokens.map((token, index) => {
          if (token.chainId !== chainId) return
          return (
            <Link
              href={`/markets/${encodeURIComponent(
                token.symbol.toLowerCase()
              )}`}
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
                    <Spacer size="sm" />
                    <Spacer size="sm" />
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
          if (token.chainId !== chainId) return
          return (
            <Link
              href={`/markets/${encodeURIComponent(
                token.symbol.toLowerCase()
              )}`}
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
                    <Spacer size="sm" />
                    <Spacer size="sm" />
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

const GreyBack = styled.div`
  background: ${(props) => props.theme.color.grey[800]};
  position: absolute;
  z-index: -100;
  min-height: 2px;
  min-width: 100%;
  left: 0;
`

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
