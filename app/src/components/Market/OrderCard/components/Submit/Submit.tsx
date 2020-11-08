import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LineItem from '@/components/LineItem'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'

import useOrders from '@/hooks/useOrders'
import useTokenBalance from '@/hooks/useTokenBalance'

import { Operation } from '@/constants/index'
import formatBalance from '@/utils/formatBalance'

import Exercise from '../Exercise/Exercise'
import LP from '../LiquidityPool/LP'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { useWeb3React } from '@web3-react/core'
import useTradeInfo from '@/hooks/useTradeInfo'
import { useTradeSettings } from '@/hooks/user'
import useOptionEntities from '@/hooks/useOptionEntities'
import { STABLECOINS } from '@/constants/index'
import formatEtherBalance from '@/utils/formatEtherBalance'
import Label from '@/components/Label'
import { formatEther } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'

export interface SubmitProps {
  orderType: Operation
}

const Submit: React.FC<SubmitProps> = ({ orderType }) => {
  const { submitOrder, item, onChangeItem, onRemoveItem } = useOrders()
  const [inputs, setInputs] = useState({
    primary: '',
    secondary: '',
  })
  const { library, chainId } = useWeb3React()
  const tradeInfo = useTradeInfo()

  const handleInputChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setInputs({ ...inputs, [e.currentTarget.name]: e.currentTarget.value })
    },
    [setInputs, inputs]
  )

  const stablecoinAddress = STABLECOINS[chainId].address
  const testEthAddress = '0xc45c339313533a6c9B05184CD8B5486BC53F75Fb'

  let tokenAddress: string
  let title: string
  let capitalLabel: string
  let isDebit: boolean
  let sign: string
  switch (orderType) {
    case Operation.LONG:
      title = 'Buy Long Tokens'
      capitalLabel = 'Buying'
      isDebit = true
      sign = '-'
      tokenAddress = stablecoinAddress
      break
    case Operation.SHORT:
      title = 'Sell Short Tokens'
      capitalLabel = 'Minting'
      isDebit = false
      sign = '+'
      tokenAddress = testEthAddress
      break
    case Operation.MINT:
      capitalLabel = 'Minting'
      tokenAddress = testEthAddress
      break
    case Operation.EXERCISE:
      capitalLabel = 'Exercising'
      tokenAddress = stablecoinAddress
      sign = '-'
      break
    case Operation.REDEEM:
      capitalLabel = 'Redeem'
      break
    case Operation.CLOSE:
      capitalLabel = 'Close'
      break
    case Operation.UNWIND:
      capitalLabel = 'Close'
      break
    case Operation.ADD_LIQUIDITY:
      title = 'Provide Liquidity'
      capitalLabel = 'LP Token'
      tokenAddress = stablecoinAddress
      break
    case Operation.REMOVE_LIQUIDITY:
      title = 'Remove Liquidity'
      capitalLabel = 'LP Token'
      tokenAddress = stablecoinAddress
      break
    case Operation.CLOSE_LONG:
      title = 'Close Long Position'
      capitalLabel = ''
      tokenAddress = stablecoinAddress
      break
    case Operation.CLOSE_SHORT:
      title = 'Close Short Position'
      capitalLabel = ''
      tokenAddress = stablecoinAddress
      break
    default:
      break
  }

  const tokenBalance = useTokenBalance(tokenAddress)

  const calculateTotalDebit = () => {
    let debit = '0'
    if (item.premium) {
      let premium = BigNumber.from(item.premium.toString())
      let size = inputs.primary === '' ? '0' : inputs.primary
      debit = formatEther(premium.mul(size).toString())
    }
    return debit
  }

  const handleSubmitClick = useCallback(() => {
    submitOrder(
      library,
      item?.address,
      Number(inputs.primary),
      orderType,
      Number(inputs.secondary)
    )
    onRemoveItem(item)
  }, [submitOrder, onRemoveItem, item, library, inputs, orderType])

  const handleSetMax = () => {
    const max =
      Math.round((+tokenBalance / +item.premium + Number.EPSILON) * 100) / 100
    setInputs({ ...inputs, primary: max.toString() })
  }

  return (
    <>
      <Box row justifyContent="flex-start">
        <IconButton
          variant="tertiary"
          size="sm"
          onClick={() => onChangeItem(item, Operation.NONE)}
        >
          <ArrowBackIcon />
        </IconButton>
        <Spacer size="sm" />
        <StyledTitle>{`${title ? title : capitalLabel}`}</StyledTitle>
      </Box>
      {orderType === Operation.ADD_LIQUIDITY ? (
        <>
          <Spacer />
          <PriceInput
            name="primary"
            title={`Quantity Options`}
            quantity={inputs.primary}
            onChange={handleInputChange}
            onClick={handleSetMax}
          />
          <Spacer />
          <PriceInput
            name="secondary"
            title={`Quantity Underlying`}
            quantity={inputs.secondary}
            onChange={handleInputChange}
            onClick={handleSetMax}
          />
          <Spacer />
          <Box row justifyContent="space-between">
            <Label text="Price per LP Token" />
            <span>${formatBalance(tokenBalance).toString()}</span>
          </Box>
        </>
      ) : (
        <>
          <Spacer />
          <LineItem
            label="Option Premium"
            data={formatEtherBalance(item.premium).toString()}
            units={item.asset}
          />
          <Spacer />
          <PriceInput
            title="Quantity"
            name="primary"
            onChange={handleInputChange}
            quantity={inputs.primary}
            onClick={handleSetMax}
          />
        </>
      )}
      <Spacer />

      {capitalLabel.length > 0 ? (
        <LineItem
          label={`${capitalLabel} Power`}
          data={tokenBalance}
          units={item.asset}
        />
      ) : (
        <> </>
      )}

      <Spacer />
      {orderType === Operation.EXERCISE ? (
        <Exercise
          cost={`${sign} ${formatBalance(+item.strike * +inputs.primary)}`}
          received={`${formatBalance(+inputs.primary)} ${item.id
            .slice(0, 3)
            .toUpperCase()}`}
        />
      ) : (
        <>
          <LineItem
            label={`Total ${isDebit ? 'Debit' : 'Credit'}`}
            data={calculateTotalDebit().toString()}
            units={`${sign ? sign : ''} ${item.asset.toUpperCase()}`}
          />
          <Spacer />
        </>
      )}
      <Button
        disabled={!inputs}
        full
        size="sm"
        onClick={handleSubmitClick}
        text="Review Transaction"
      />
    </>
  )
}

const StyledTitle = styled.h5`
  align-items: center;
  color: ${(props) => props.theme.color.white};
  display: flex;
  font-size: 18px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px;
`
export default Submit
