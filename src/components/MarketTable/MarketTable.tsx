import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import TableCell from '@/components/TableCell'
import TableBody from '@/components/TableBody'
import TableRow from '@/components/TableRow'
import Spacer from '@/components/Spacer'

import Loader from '../Loader'

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
                    <Spacer size="sm" />
                    {token.name}
                  </Asset>
                </TableCell>
                <TableCell>DeFi Token</TableCell>
                {/**
                 * 
                 * <TableCell>
                  <Asset>
                    <img
                      height="32"
                      src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png"
                      style={{ borderRadius: '50%' }}
                      alt={'icon'}
                    />
                  </Asset>
                </TableCell>
                 */}
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
