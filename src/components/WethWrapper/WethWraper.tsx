import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import Card from '@/components/Card'
import CardTitle from '@/components/CardTitle'
import CardContent from '@/components/CardContent'
import Title from '@/components/Title'
import Spacer from '@/components/Spacer'
import PriceInput from '@/components/PriceInput'
import Box from '@/components/Box'
import LineItem from '@/components/LineItem'
import Button from '@/components/Button'
import Separator from '@/components/Separator'
import Switch from '@/components/Switch'

import numeral from 'numeral'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import useTokenBalance from '@/hooks/useTokenBalance'
import useTokenAllowance from '@/hooks/useTokenAllowance'
import { useWeb3React } from '@web3-react/core'
import { tryParseAmount } from '@/utils/tryParseAmount'
import { useSwapActionHandlers, useSwap } from '@/state/swap/hooks'
import { useAddNotif } from '@/state/notifs/hooks'
import useApprove from '@/hooks/transactions/useApprove'
import executeTransaction from '@/utils/executeTransaction'
import { useTransactionAdder } from '@/state/transactions/hooks'

import { TokenAmount, Token } from '@sushiswap/sdk'
import { ethers } from 'ethers'
import { parseEther, formatEther } from 'ethers/lib/utils'

import WethArtifact from '@primitivefi/contracts/artifacts/WETH9.json'
import { SinglePositionParameters, WETH9 } from '@primitivefi/sdk'

const WethWrapper: React.FC = () => {
  const { active, library, chainId, account } = useWeb3React()
  const [wrap, setWrap] = useState(true)
  const [weth, setWeth] = useState('')
  const [ethBal, setEthBal] = useState('0')
  const [col, setCol] = useState(true)
  //const { typedValue, inputLoading } = useSwap()
  const [typedValue, setTypedValue] = useState('')
  //const { onUserInput } = useSwapActionHandlers()
  const parsedAmount = tryParseAmount(typedValue)
  const onApprove = useApprove()
  const addNotif = useAddNotif()
  const addTransaction = useTransactionAdder()

  const ETH_TOKEN = new Token(
    chainId,
    ethers.constants.AddressZero,
    18,
    'ETH',
    'Ether'
  )

  const onUserInput = useCallback(
    (value: string) => {
      if (value.substr(0) === '.') {
        value = '0.'
      }
      setTypedValue(value)
    },
    [setTypedValue]
  )

  useEffect(() => {
    if (active) {
      setWeth(WETH9[chainId].address)
    }
  }, [active, WETH9, chainId])

  const getEthBalance = async () => {
    const bal = await library.getBalance(account)
    return bal
  }

  useEffect(() => {
    ;(async () => {
      const bal = await getEthBalance()
      setEthBal(bal)
    })()
  }, [account])

  const wethBalance = useTokenBalance(weth)
  const wethAllowance = useTokenAllowance(weth, weth)

  const isApproved = useCallback(() => {
    const approved = parseEther(wethAllowance).gt(parsedAmount)
    return approved
  }, [wethAllowance, parsedAmount])

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(value)
    },
    [onUserInput]
  )
  const handleSetMax = useCallback(() => {
    onUserInput(wethBalance)
  }, [account, wethBalance, onUserInput])
  const handleSetEthMax = useCallback(() => {
    onUserInput(formatEther(ethBal))
  }, [account, ethBal, onUserInput])

  const handleToggleClick = useCallback(() => {
    const prevTypedValue = typedValue
    setWrap(!wrap)
    onUserInput(prevTypedValue ? prevTypedValue : '0')
  }, [wrap, setWrap, typedValue, onUserInput])

  const handleApproval = useCallback(() => {
    onApprove(weth, weth, parsedAmount)
      .then(() => {
        addNotif(
          0,
          `Approving Weth`,
          'You may need to refresh after the approval is confirmed.',
          ''
        )
      })
      .catch((error) => {
        addNotif(0, `Approving Weth`, error.message, '')
      })
  }, [weth, onApprove])

  const now = () => new Date().getTime()

  const handleSubmitClick = useCallback(() => {
    ;(async () => {
      const signer = await library.getSigner()
      const contract = new ethers.Contract(weth, WethArtifact.abi, signer)
      const methodName = wrap ? 'deposit' : 'withdraw'
      const args = wrap ? [] : [parsedAmount.toString()]
      const value = wrap ? parsedAmount.toString() : '0'
      const transaction: SinglePositionParameters = {
        contract,
        methodName,
        args,
        value,
      }
      executeTransaction(signer, transaction)
        .then((tx) => {
          if (tx.hash) {
            addTransaction(
              {
                summary: {
                  type: '0',
                  option: null,
                  amount: numeral(
                    parseInt(formatEther(parsedAmount.toString()))
                  )
                    .format('0.00(a)')
                    .toString(),
                },
                hash: tx.hash,
                addedTime: now(),
                from: account,
              },
              0
            )
          }
        })
        .catch((err) => {
          addNotif(0, 'Order Error', `${err.message}`, '')
        })
    })()
  }, [library, account, parsedAmount, wrap])
  return (
    <Card border>
      <StyledDiv>
        <div onClick={() => setCol(!col)}>
          <StyledBox row alignItems="center">
            <Title>Wrap ETH</Title>
            <Spacer />
            <Spacer />
            <Spacer />
            {col ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </StyledBox>
        </div>
        {col ? null : (
          <>
            <Spacer size="sm" />
            <Switch
              active={wrap}
              onClick={handleToggleClick}
              primaryText="Wrap"
              secondaryText="Unwrap"
            />
            <CardContent>
              <PriceInput
                title={wrap ? 'Wrap' : 'Unwrap'}
                quantity={typedValue}
                onChange={handleTypeInput}
                onClick={wrap ? handleSetEthMax : handleSetMax}
                balance={
                  wrap
                    ? new TokenAmount(ETH_TOKEN, ethBal)
                    : new TokenAmount(
                        WETH9[chainId],
                        parseEther(wethBalance).toString()
                      )
                }
              />
              <Spacer />
              <Button
                onClick={
                  isApproved() || wrap ? handleSubmitClick : handleApproval
                }
                text={isApproved() || wrap ? 'Confirm' : 'Approve'}
              />
            </CardContent>
          </>
        )}
      </StyledDiv>
    </Card>
  )
}

const StyledDiv = styled.div`
  padding: 1em;
  display: flex;
  flex-direction: column;
  justify-content: center;
`
const StyledBox = styled(Box)`
  cursor: pointer;
  color: ${(props) => props.theme.color.white};
`
export default WethWrapper
