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
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'
import WarningIcon from '@material-ui/icons/Warning'
import { DEFAULT_SLIPPAGE } from '@/constants/index'
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

  const [wethU, setWethU] = useState(true) // weth uniswap 15
  const [daiU, setDaiU] = useState(true) // dai u 16
  const [yfi, setYfi] = useState(true) // yfi 17

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
            console.log(address, ' -> ', tokenAllowance.toString())

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

          case 15: // weth U
            tokenAllowance = await getAllowance(
              address,
              '0x66fD5619a2a12dB3469e5A1bC5634f981e676c75'
            )
            setWethU(tokenAllowance.gt(2))
            break
          case 16: // dai U
            tokenAllowance = await getAllowance(
              address,

              '0x66fD5619a2a12dB3469e5A1bC5634f981e676c75'
            )
            setDaiU(tokenAllowance.gt(2))
            break
          case 17: // yfi
            tokenAllowance = await getAllowance(
              address,
              '0x66fD5619a2a12dB3469e5A1bC5634f981e676c75'
            )
            setYfi(tokenAllowance.gt(2))
            break
          default:
            break
        }
      })
    }
    if (account) {
      loadAllowances().finally(() => setLoading(false))
    }
  }, [account])
  return (
    <>
      <Spacer />
      <StyledTitle>Approval Reset Tool</StyledTitle>
      <Spacer />

      <StyledSub>
        Double-check if you are vulnerable by searching for your address on the
        Etherscan approval checker
      </StyledSub>
      <a
        style={{ color: 'white' }}
        href="https://etherscan.io/tokenapprovalchecker"
        target="__blank"
      >
        https://etherscan.io/tokenapprovalchecker
      </a>
      <Spacer />
      {loading ? (
        <Loader />
      ) : (
        <>
          {sushi ||
          dai ||
          weth ||
          sushiCL ||
          sushiCS ||
          sushiCLP ||
          sushiPL ||
          sushiPS ||
          sushiPLP ||
          wethCL ||
          wethCS ||
          wethCLP ||
          wethPL ||
          wethPS ||
          wethPLP ||
          wethU ||
          daiU ||
          yfi ? (
            <>
              <StyledNot>
                <WarningIcon />
                <Spacer size="sm" />
                YOU ARE VULNERABLE TO EXPLOIT - PLEASE RESET ALL APPROVALS{' '}
                <Spacer size="sm" />
                <WarningIcon />
              </StyledNot>
              <Spacer />
              <Button variant="secondary" onClick={() => router.reload()}>
                RE-CHECK APPROVALS
              </Button>
            </>
          ) : (
            <StyledReady>
              <VerifiedUserIcon /> <Spacer size="sm" />
              YOU ARE PROTECTED, NO OPEN APPROVALS <Spacer size="sm" />
              <VerifiedUserIcon />
            </StyledReady>
          )}
          <Spacer />

          <Container>
            <StyledColumn>
              <Box row justifyContent="flex-start" alignItems="center">
                <StyledSub>Sushi Connector</StyledSub>
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
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset SUSHI
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
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
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset DAI
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
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
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset SUSHI-CALL-LONG
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
                      SUSHI-CALL-LONG Protected
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
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset SUSHI-CALL-SHORT
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
                      SUSHI-CALL-SHORT Protected
                    </Button>
                  )}
                  {sushiCLP ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0xbff6cbf2e7d2cd0705329c735a37be33241298e9',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset SUSHI-CALL-LP
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
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
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset SUSHI-PUT-LONG
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
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
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset SUSHI-PUT-SHORT
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
                      SUSHI-PUT-SHORT Protected
                    </Button>
                  )}
                  {sushiPLP ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0x45e185Be5d2FE76b71fE4283EaAD9679E674c77f',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset SUSHI-PUT-LP
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
                      SUSHI-PUT-LP Protected
                    </Button>
                  )}
                </div>
              </Box>
            </StyledColumn>
            <Spacer />

            <StyledColumn>
              <Box row>
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
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset WETH
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
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
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset DAI
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
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
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset WETH-CALL-LONG
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
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
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset WETH-CALL-SHORT
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
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
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset WETH-CALL-LP
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
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
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset WETH-PUT-LONG
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
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
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset WETH-PUT-SHORT
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
                      WETH-PUT-SHORT Protected
                    </Button>
                  )}
                  {wethPLP ? (
                    <Button
                      onClick={async () =>
                        onApprove(
                          '0xfe7f6780a3c19aef662edd7076f63c2ae99a2196',
                          SUSHISWAP_CONNECTOR[1]
                        )
                      }
                    >
                      <WarningIcon />
                      <Spacer size="sm" />
                      Reset WETH-PUT-LP
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      <VerifiedUserIcon />
                      <Spacer size="sm" />
                      WETH-PUT-LP Protected
                    </Button>
                  )}
                </div>
              </Box>
            </StyledColumn>
          </Container>
          <Spacer />
          <Container>
            <Box row justifyContent="flex-start" alignItems="center">
              <StyledSub>Uniswap Connector</StyledSub>
              <Spacer />
              <div>
                {wethU ? (
                  <Button
                    onClick={async () =>
                      onApprove(
                        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        '0x66fD5619a2a12dB3469e5A1bC5634f981e676c75'
                      )
                    }
                  >
                    <WarningIcon />
                    <Spacer size="sm" />
                    Reset WETH
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    <VerifiedUserIcon />
                    <Spacer size="sm" />
                    WETH Protected
                  </Button>
                )}
                {daiU ? (
                  <Button
                    onClick={async () =>
                      onApprove(
                        '0x6b175474e89094c44da98b954eedeac495271d0f',
                        '0x66fD5619a2a12dB3469e5A1bC5634f981e676c75'
                      )
                    }
                  >
                    <WarningIcon />
                    <Spacer size="sm" />
                    Reset DAI
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    <VerifiedUserIcon />
                    <Spacer size="sm" />
                    DAI Protected
                  </Button>
                )}
                {yfi ? (
                  <Button
                    onClick={async () =>
                      onApprove(
                        '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
                        '0x66fD5619a2a12dB3469e5A1bC5634f981e676c75'
                      )
                    }
                  >
                    <WarningIcon />
                    <Spacer size="sm" />
                    Reset YFI
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    <VerifiedUserIcon />
                    <Spacer size="sm" />
                    YFI Protected
                  </Button>
                )}
              </div>
            </Box>
          </Container>
          <Spacer />
          <Spacer />
        </>
      )}
    </>
  )
}
const Container = styled.div`
  max-width: 1000px;
  margin-bottom: 1em;
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
  color: green !important;
  display: flex;
  align-items: center;
`

const StyledNot = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: red !important;
  display: flex;
  align-items: center;
`
export default Reset
