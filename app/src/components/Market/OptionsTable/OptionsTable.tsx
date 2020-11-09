import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'

import Spacer from '@/components/Spacer'
import LitContainer from '@/components/LitContainer'
import Table from '@/components/Table'
import TableBody from '@/components/TableBody'
import TableCell from '@/components/TableCell'
import TableRow from '@/components/TableRow'
import Loader from '@/components/Loader'
import useOrders from '@/hooks/useOrders'
import useOptions from '@/hooks/useOptions'
import LaunchIcon from '@material-ui/icons/Launch'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import AddIcon from '@material-ui/icons/Add'
import formatAddress from '@/utils/formatAddress'
import formatBalance from '@/utils/formatBalance'
import formatEtherBalance from '@/utils/formatEtherBalance'
import { useWeb3React } from '@web3-react/core'
import { ETHERSCAN_MAINNET, ETHERSCAN_RINKEBY } from '@/constants/index'
import { Operation } from '@/constants/index'

import { BigNumber } from 'ethers'
import { COINGECKO_ID_FOR_MARKET } from '@/constants/index'
import useSWR from 'swr'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { EmptyAttributes } from '@/contexts/Options/types'

export type FormattedOption = {
  breakEven: number
  change: number
  premium: number
  strike: number
  volume: number
}

export interface OptionsTableProps {
  optionExp: number
  asset: string
  assetAddress: string
  callActive: boolean
}

const OptionsTable: React.FC<OptionsTableProps> = (props) => {
  const { callActive, asset, assetAddress, optionExp } = props
  const { options, getOptions } = useOptions()
  const { onAddItem, item } = useOrders()
  const { library, chainId } = useWeb3React()

  const getMarketDetails = useCallback(() => {
    const key: string = COINGECKO_ID_FOR_MARKET[asset]
    return { key }
  }, [asset])

  const { key } = getMarketDetails()

  const { data } = useSWR(
    `https://api.coingecko.com/api/v3/simple/price?ids=${key}&vs_currencies=usd&include_24hr_change=true`
  )

  useEffect(() => {
    if (library) {
      if (asset === 'eth') {
        getOptions('WETH')
      } else {
        getOptions(asset.toUpperCase())
      }
    }
  }, [library, asset, getOptions])

  const calculateBreakeven = useCallback(
    (premiumWei, isCall) => {
      const price = data
        ? data[key]
          ? data[key].usd
            ? data[key].usd
            : '0'
          : '0'
        : '0'
      const spotPrice = price.toString()
      const spotPriceWei = parseEther(spotPrice)
      let breakeven = BigNumber.from(premiumWei.toString())
        .mul(spotPriceWei)
        .div(parseEther('1'))
      breakeven = isCall
        ? breakeven.add(spotPriceWei)
        : spotPriceWei.sub(breakeven)
      return breakeven.toString()
    },
    [key, data]
  )

  const type = callActive ? 'calls' : 'puts'
  const baseUrl = chainId === 4 ? ETHERSCAN_RINKEBY : ETHERSCAN_MAINNET
  const headers = [
    'Strike Price',
    'Break Even',
    'Price',
    '2% Depth',
    'Reserve',
    'Contract',
    '',
  ]
  return (
    <Table>
      <StyledTableHead>
        <LitContainer>
          <TableRow isHead>
            {headers.map((header, index) => {
              if (index === headers.length - 1) {
                return (
                  <StyledButtonCell key={header}>{header}</StyledButtonCell>
                )
              }
              return <TableCell key={header}>{header}</TableCell>
            })}
          </TableRow>
        </LitContainer>
      </StyledTableHead>
      <LitContainer>
        {options.loading ? (
          <>
            <Spacer />
            <Loader />
          </>
        ) : (
          <TableBody>
            {options[type].map((option) => {
              const {
                entity,
                breakEven,
                premium,
                strike,
                reserves,
                token0,
                token1,
                depth,
                address,
                expiry,
              } = option
              if (optionExp != expiry && expiry === 0) return null
              const reserve0Units =
                token0 === entity.assetAddresses[0]
                  ? asset.toUpperCase()
                  : 'SHORT'
              return (
                <TableRow
                  key={address}
                  onClick={() => {
                    onAddItem(
                      {
                        ...option,
                      },
                      Operation.NONE
                    )
                  }}
                >
                  <TableCell>${formatBalance(strike)}</TableCell>
                  <TableCell>
                    ${' '}
                    {formatEtherBalance(
                      calculateBreakeven(premium, entity.isCall)
                    )}
                  </TableCell>
                  {premium > 0 ? (
                    <TableCell>
                      {formatEtherBalance(premium)} {asset.toUpperCase()}
                    </TableCell>
                  ) : (
                    <TableCell>-</TableCell>
                  )}
                  {depth > 0 ? (
                    <TableCell>
                      {depth} {'Options'}
                    </TableCell>
                  ) : (
                    <TableCell>-</TableCell>
                  )}
                  {BigNumber.from(reserves[0]).gt(0) ? (
                    <TableCell>
                      {reserve0Units === asset.toUpperCase()
                        ? formatEtherBalance(reserves[0].toString())
                        : formatEtherBalance(reserves[1].toString())}{' '}
                      {asset.toUpperCase()} /{' '}
                      {reserve0Units === asset.toUpperCase()
                        ? formatEtherBalance(reserves[1].toString())
                        : formatEtherBalance(reserves[0].toString())}{' '}
                      {'SHORT'}
                    </TableCell>
                  ) : (
                    <TableCell>-</TableCell>
                  )}
                  <TableCell key={address}>
                    <StyledARef
                      href={`${baseUrl}/${option.address}`}
                      target="__blank"
                    >
                      {formatAddress(option.address)}{' '}
                      <LaunchIcon style={{ fontSize: '14px' }} />
                    </StyledARef>
                  </TableCell>
                  <StyledButtonCell key={'Open'}>
                    <ArrowForwardIosIcon />
                  </StyledButtonCell>
                </TableRow>
              )
            })}
            <TableRow
              isActive
              onClick={() => {
                onAddItem(EmptyAttributes, Operation.NEW_MARKET) //TBD
              }}
            >
              <TableCell></TableCell>
              <StyledButtonCellError key={'Open'}>
                <AddIcon />
                <Spacer size="md" />
                Add a New Option Market
              </StyledButtonCellError>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        )}
      </LitContainer>
    </Table>
  )
}
const StyledARef = styled.a`
  color: ${(props) => props.theme.color.white};
  text-decoration: none;
`

const StyledTableHead = styled.div`
  background-color: ${(props) => props.theme.color.grey[800]};
  border-bottom: 1px solid ${(props) => props.theme.color.grey[600]};
`

const StyledButtonCell = styled.div`
  font-weight: inherit;
  flex: 0.25;
  margin-right: ${(props) => props.theme.spacing[2]}px;
  width: ${(props) => props.theme.buttonSize}px;
`

const StyledButtonCellError = styled.div`
  font-weight: inherit;
  display: flex;
  flex: 1;
  color: ${(props) => props.theme.color.white};
  margin-right: ${(props) => props.theme.spacing[2]}px;
  width: ${(props) => props.theme.buttonSize}px;
`

export default OptionsTable
