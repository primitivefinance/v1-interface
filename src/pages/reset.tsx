import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
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
  const router = useRouter()
  useEffect(() => {
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
      setLoading(false)
    }
    if (account) {
      loadAllowances()
    }
  }, [account])
  return (
    <>
      <Spacer />
      <StyledTitle>Allowance Reset Tool</StyledTitle>
      <Spacer />
      <Spacer />

      {loading ? (
        <Loader />
      ) : (
        <>
          {ready ? (
            <StyledReady>YOU ARE PROTECTED, NO OPEN APPROVALS</StyledReady>
          ) : (
            <>
              <StyledNot>
                YOU ARE VULNERABLE TO EXPLOIT - PLEASE RESET ALL APPROVALS
              </StyledNot>
              <Spacer />
              <Button variant="secondary" onClick={() => router.reload()}>
                RE-CHECK APPROVALS
              </Button>
            </>
          )}
          <Spacer />
          <Spacer />

          <Container>
            <StyledColumn>
              <Box row>
                <StyledSub>SUSHI Markets</StyledSub>
                <Spacer />
                <div>
                  {sushi ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset SUSHI
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      SUSHI Protected
                    </Button>
                  )}
                  {dai ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0x6b175474e89094c44da98b954eedeac495271d0f',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset DAI
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      DAI Protected
                    </Button>
                  )}
                  {sushiCL ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0x875f1f8e7426b91c388807d5257f73700d04d653',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset SUSHI-CALL-LONG
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      SUSHI-LONG Protected
                    </Button>
                  )}
                  {sushiCS ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0x81eb1e0acfd705c34e975397de7545b6a9f0be39',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset SUSHI-CALL-SHORT
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      SUSHI-SHORT Protected
                    </Button>
                  )}
                  {sushiCLP ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0x875f1f8e7426b91c388807d5257f73700d04d653',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset SUSHI-CALL-LP
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      SUSHI-CALL-LP Protected
                    </Button>
                  )}
                  {sushiPL ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0x6688E09a0af5dAfa2a6dcD09f180F084ad964005',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset SUSHI-PUT-LONG
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      SUSHI-PUT-LONG Protected
                    </Button>
                  )}
                  {sushiPS ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0xee1482a2c48f0012862e45a992666096fc767b78',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset SUSHI-PUT-SHORT Trades
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      SUSHI-PUT-SHORT Protected
                    </Button>
                  )}
                  {sushiPLP ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0xfe7f6780a3c19aef662edd7076f63c2ae99a2196',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset SUSHI-PUT-LP Trades
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      SUSHI-PUT-LP Protected
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
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset WETH
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      WETH Protected
                    </Button>
                  )}
                  {dai ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0x6b175474e89094c44da98b954eedeac495271d0f',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset DAI
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      DAI Protected
                    </Button>
                  )}
                  {wethCL ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0x5b419b581081f8e38a3c450ae518e0aefd4a32b4',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset WETH-CALL-LONG
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      WETH-CALL-LONG Protected
                    </Button>
                  )}
                  {wethCS ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0x9e5405a11e42e7d48fbf4f2e979695641c15189b',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset WETH-CALL-SHORT
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      WETH-CALL-SHORT Protected
                    </Button>
                  )}
                  {wethCLP ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0x2acbf90fdff006eb6eae2b61145b603e59ade7d2',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset WETH-CALL-LP
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      WETH-CALL-LP Protected
                    </Button>
                  )}
                  {wethPL ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0x5b83dec645be2b8137a20175f59000c20c6dce82',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset WETH-PUT-LONG
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      WETH-PUT-LONG Protected
                    </Button>
                  )}
                  {wethPS ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0xee1482a2c48f0012862e45a992666096fc767b78',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset WETH-PUT-SHORT
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      WETH-PUT-SHORT Protected
                    </Button>
                  )}
                  {wethPLP ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0x45e185be5d2fe76b71fe4283eaad9679e674c77f',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      Reset WETH-PUT-LP
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      WETH-PUT-LP Protected
                    </Button>
                  )}
                </div>
              </Box>
            </StyledColumn>
          </Container>
        </>
      )}
    </>
  )
}
const Container = styled.div`
  max-width: 1000px;
  margin-bottom: 5em;
  display: flex;
  flex-direction: row;
  color: default;
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

const StyledReady = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.color.green};
`

const StyledNot = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: red !important;
`
export default Reset
