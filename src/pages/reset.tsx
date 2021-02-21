import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import Loader from '@/components/Loader'
import { useGetTokenAllowance } from '@/hooks/useTokenAllowance'
import Spacer from '@/components/Spacer'
import useApprove from '@/hooks/transactions/useApprove'
import { Grid, Col, Row } from 'react-styled-flexboxgrid'
import Button from '@/components/Button'
import { tokens } from '@/constants/options'
import { useActiveWeb3React } from '@/hooks/user/index'
import { SUSHISWAP_CONNECTOR } from '@primitivefi/sdk'

const Reset = () => {
  const [sushi, setSushi] = useState(true) // sushi 0
  const [dai, setDAI] = useState(true) // DAI 1
  const [weth, setWETH] = useState(true) // WETH 2
  const [sushiCL, setSushiCL] = useState(true) // sushi call long 3
  const [sushiCS, setSushiCS] = useState(true) // sushi call short 4
  const [sushiCLP, setSushiCLP] = useState(true) // sushi call LP 5
  const [sushiPL, setSushiPL] = useState(true) // sushi put long 6
  const [sushiPS, setSushiPS] = useState(true) // sushi put short 7
  const [sushiPLP, setSushiPLP] = useState(true) // sushi put LP 8
  const [wethCL, setWethCL] = useState(true) // weth call long 9
  const [wethCS, setWethCS] = useState(true) // weth call short 10
  const [wethCLP, setWethCLP] = useState(true) // weth call LP 11
  const [wethPL, setWethPL] = useState(true) // weth put long 12
  const [wethPS, setWethPS] = useState(true) // weth put short 13
  const [wethPLP, setWethPLP] = useState(true) // weth put LP 14

  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const { account } = useActiveWeb3React()
  const getAllowance = useGetTokenAllowance()
  const onApprove = useApprove()
  useEffect(() => {
    setLoading(false)
    const loadAllowances = async () => {
      tokens.map(async (address, index) => {
        let tokenAllowance
        switch (index) {
          case 0: // sushi
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setSushi(tokenAllowance.gt(2))
            break
          case 1: // DAI
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setDAI(tokenAllowance.gt(2))
            break
          case 2: // WETH
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setWETH(tokenAllowance.gt(2))
            break
          case 3: // sushi call long
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setSushiCL(tokenAllowance.gt(2))
            break
          case 4: // sushi call short
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setSushiCS(tokenAllowance.gt(2))
            break
          case 5: // sushi call LP
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setSushiCLP(tokenAllowance.gt(2))
            break
          case 6: // sushi put long
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setSushiPL(tokenAllowance.gt(2))
            break
          case 7: // sushi put short
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setSushiPS(tokenAllowance.gt(2))
            break
          case 8: // sushi put LP
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setSushiPLP(tokenAllowance.gt(2))
            break
          case 9: // weth call long
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setWethCL(tokenAllowance.gt(2))
            break
          case 10: // weth call short
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setWethCS(tokenAllowance.gt(2))
            break
          case 11: // weth call LP
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setWethCLP(tokenAllowance.gt(2))
            break
          case 12: // weth put long
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setWethPL(tokenAllowance.gt(2))
            break
          case 13: // weth put short
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setWethPS(tokenAllowance.gt(2))
            break
          case 14: // weth put lp
            tokenAllowance = await getAllowance(address, SUSHISWAP_CONNECTOR[1])
            setWethPLP(tokenAllowance.gt(2))
            break
          default:
            break
        }
      })
    }
    loadAllowances()
  }, [])
  return (
    <>
      <Spacer />
      <StyledTitle>Reset Allowances</StyledTitle>
      <Spacer />
      <Spacer />
      <Container>
        <StyledColumn>
          <Box row>
            <StyledSub>SUSHI Markets</StyledSub>
            <Spacer />
            <div>
              {sushi ? (
                <Button>Reset SUSHI</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified SUSHI Trades!
                </Button>
              )}
              {dai ? (
                <Button>Reset DAI</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified DAI Trades!
                </Button>
              )}
              {sushiCL ? (
                <Button>Reset SUSHI-CALL-LONG</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified SUSHI-LONG Trades!
                </Button>
              )}
              {sushiCS ? (
                <Button>Reset SUSHI-CALL-SHORT</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified SUSHI-SHORT Trades!
                </Button>
              )}
              {sushiCLP ? (
                <Button>Reset SUSHI-CALL-LP</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified SUSHI-CALL-LP Trades!
                </Button>
              )}
              {sushiPL ? (
                <Button>Reset SUSHI-PUT-LONG</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified SUSHI-PUT-LONG Trades!
                </Button>
              )}
              {sushiPS ? (
                <Button>Reset SUSHI-PUT-SHORT Trades</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified SUSHI-PUT-SHORT Trades!
                </Button>
              )}
              {sushiPLP ? (
                <Button>Reset SUSHI-PUT-LP Trades</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified SUSHI-PUT-LP Trades!
                </Button>
              )}
            </div>
          </Box>
        </StyledColumn>
        <Spacer />

        <StyledColumn>
          <Box row>
            <StyledSub>WETH Markets</StyledSub>
            <Spacer />

            <div>
              {weth ? (
                <Button>Reset WETH</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified WETH Trades!
                </Button>
              )}
              {dai ? (
                <Button>Reset DAI</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified DAI Trades!
                </Button>
              )}
              {wethCL ? (
                <Button>Reset WETH-CALL-LONG</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Veriiedy WETH-CALL-LONG Trades!
                </Button>
              )}
              {wethCS ? (
                <Button>Reset WETH-CALL-SHORT</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified WETH-CALL-SHORT Trades!
                </Button>
              )}
              {wethCLP ? (
                <Button>Reset WETH-CALL-LP</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified WETH-CALL-LP Trades!
                </Button>
              )}
              {wethPL ? (
                <Button>Reset WETH-PUT-LON</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified WETH-PUT-LONG Trades!
                </Button>
              )}
              {wethPS ? (
                <Button>Reset WETH-PUT-SHORT</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified WETH-PUT-SHORT Trades!
                </Button>
              )}
              {wethPLP ? (
                <Button>Reset WETH-PUT-LP</Button>
              ) : (
                <Button variant="secondary" disabled>
                  Verified WETH-PUT-LP Trades!
                </Button>
              )}
            </div>
          </Box>
        </StyledColumn>
      </Container>
    </>
  )
}
const Container = styled.div`
  max-width: 1000px;
  margin-bottom: 5em;
  display: flex;
  flex-direction: row;
`
const StyledColumn = styled(Col)`
  width: 30em;
`
const StyledTitle = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: ${(props) => props.theme.color.white};
`
const StyledSub = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.color.grey[400]};
`
export default Reset
