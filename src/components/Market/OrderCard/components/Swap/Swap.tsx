import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import Label from '@/components/Label'
import LineItem from '@/components/LineItem'
import Loader from '@/components/Loader'
import PriceInput from '@/components/PriceInput'
import Spacer from '@/components/Spacer'
import WarningLabel from '@/components/WarningLabel'
import Title from '@/components/Title'
import Description from '@/components/Description'
import CardHeader from '@/components/CardHeader'
import Switch from '@/components/Switch'
import Separator from '@/components/Separator'
import OptionTextInfo from '@/components/OptionTextInfo'
import { Operation, SignitureData, WETH9 } from '@primitivefi/sdk'

import { BigNumber, BigNumberish, ethers } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'

import useApprove from '@/hooks/transactions/useApprove'
import { useDAIPermit, usePermit } from '@/hooks/transactions/usePermit'
import useTokenBalance from '@/hooks/useTokenBalance'
import { useSlippage } from '@/state/user/hooks'

import {
  ADDRESS_ZERO,
  Venue,
  SUSHI_ROUTER_ADDRESS,
  PRIMITIVE_ROUTER,
  TRADER,
} from '@primitivefi/sdk'

import formatBalance from '@/utils/formatBalance'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import formatExpiry from '@/utils/formatExpiry'

import {
  useItem,
  useUpdateItem,
  useHandleSubmitOrder,
  useRemoveItem,
} from '@/state/order/hooks'
import { useAddNotif } from '@/state/notifs/hooks'
import {
  useSwapActionHandlers,
  useSwap,
  useSetSwapLoaded,
  useToggleReduce,
} from '@/state/swap/hooks'
import { useWeb3React } from '@web3-react/core'
import { Token, TokenAmount } from '@sushiswap/sdk'
import formatEtherBalance from '@/utils/formatEtherBalance'
import numeral from 'numeral'
import { tryParseAmount } from '@/utils/tryParseAmount'
import { sign } from 'crypto'
import useBalance from '@/hooks/useBalance'
import Downgrade from './Downgrade'
const formatParsedAmount = (amount: BigNumberish) => {
  const bigAmt = BigNumber.from(amount)
  return numeral(formatEther(bigAmt)).format(
    bigAmt.lt(parseEther('0.01')) ? '0.0000' : '0.00'
  )
}

const Swap: React.FC = () => {
  //state
  const [description, setDescription] = useState(false)
  const [signData, setSignData] = useState<SignitureData>(null)
  // executes transactions
  const submitOrder = useHandleSubmitOrder()
  const updateItem = useUpdateItem()
  const removeItem = useRemoveItem()
  // approval state
  const { item, orderType, loading, approved } = useItem()
  // slippage
  const slippage = useSlippage()
  // pair and option entities
  const entity = item.entity

  const [impact, setImpact] = useState('0.00')
  const [error, setError] = useState(false)
  // set null lp
  const [hasLiquidity, setHasL] = useState(false)
  // inputs for quant
  const { typedValue, inputLoading, reduce } = useSwap()
  const toggleReduce = useToggleReduce()
  const { onUserInput } = useSwapActionHandlers()
  const parsedAmount = tryParseAmount(typedValue)
  const swapLoaded = useSetSwapLoaded()
  // web3
  const { library, chainId } = useWeb3React()
  const addNotif = useAddNotif()
  const title = {
    text: `Close - ${numeral(item.entity.strikePrice).format(
      +item.entity.strikePrice > 5 ? '$0' : '$0.00'
    )} ${item.entity.isCall ? 'Call' : 'Put'} ${formatExpiry(
      item.entity.expiryValue
    ).utc.substr(4, 12)}`,
    tip: `Sell short option tokens for ${item.asset.toUpperCase()}`,
  }
  return (
    <>
      <Box column alignItems="center">
        <CardHeader title={title} onClick={() => removeItem()} />
        <Spacer size="sm" />
        <Spacer size="sm" />
        <Spacer size="sm" />

        <Downgrade />
      </Box>
    </>
  )
}
const WarningTooltip = styled.div`
  color: yellow;
  font-size: 18px;
  display: table;
  align-items: center;
  justify-content: center;
  width: 100%;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-align: center;
  vertical-align: middle;
  font-size: 14px;
  opacity: 1;
`

const StyledInnerTitle = styled.div`
  color: ${(props) => props.theme.color.white};
  font-size: 24px;
  font-weight: 700;
  display: flex;
  flex: 1;
  width: 100%;
  letter-spacing: 0.5px;
`

const PurchaseInfo = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
  vertical-align: middle;
  display: table;
  margin-bottom: -1em;
`
const StyledEnd = styled(Box)`
  min-width: 100%;
`
export default Swap
