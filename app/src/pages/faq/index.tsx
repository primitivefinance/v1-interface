import React, { useEffect } from 'react'
import styled from 'styled-components'

import Link from 'next/link'

const FAQ: React.FC = () => {
  return (
    <>
      <StyledSpacer size={48} />
      <StyledFAQ>
        <StyledTitle>Frequently Asked Questions</StyledTitle>
        <StyledSpacer size={24} />

        <StyledText>A simple explainer to get you started.</StyledText>
        <StyledSpacer size={24} />

        <StyledSubtitle>What is Primitive?</StyledSubtitle>
        <StyledSpacer size={24} />
        <StyledText>
          Primitive is an autonomous options platform for decentralized finance.
          Option tokens are traded and settled permissionlessly using the
          protocol's smart contracts.
        </StyledText>
        <StyledSpacer size={24} />

        <StyledSubtitle>Why are options useful?</StyledSubtitle>
        <StyledSpacer size={24} />
        <StyledText>
          Options allow you to manage portfolio risk. Traders, merchants, and
          investors have used options to manage and hedge risk because they are
          grant control over valuable assets for a fraction of a cost. Now
          anyone can use this instrument to manage risk for ETH and tokens
          issued on Ethereum (ERC-20). For further background on options and how
          they can help manage risk, please refer to the{' '}
          <Link
            href={
              'https://www.investopedia.com/options-basics-tutorial-4583012'
            }
          >
            <StyledNavItem>Essential Options Trading Guide</StyledNavItem>
          </Link>{' '}
          by Investopedia.
          <StyledSpacer size={24} />
        </StyledText>
        <StyledSpacer size={24} />

        <StyledSubtitle>How can I buy/sell an option?</StyledSubtitle>
        <StyledSpacer size={24} />
        <StyledText>
          Depending on what position you want to take, you would take the
          following actions:
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          1. Buy to Open (ie. go long on a Call or Put option
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          2. **Sell to Open (ie. go short on a Call or Put option)** After
          choosing whether you want a Call or Put:
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>3. Closing Out a Position Before Expiry</StyledText>
        <StyledSpacer size={24} />

        <StyledSubtitle>Can you walk me through an example?</StyledSubtitle>
        <StyledSpacer size={24} />
        <StyledText>
          Let's say you are bearish on ETH and want to collect a premium, so you
          short a Call option. These are the steps you'd take: 1. Mint the Call
          option by depositing 1 ETH (underlying); receive Long Token, Short
          Token, and Redeem Token which is your claim on the underlying if the
          option never gets exercised.
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>2. Sell the Long Token for a premium on an AMM.</StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          3a. If the option expires Out of the Money (OTM), you use your redeem
          token to withdraw the original 1 ETH you deposited to mint the option.
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          3a. If the option expires Out of the Money (OTM), you use your redeem
          token to withdraw the original 1 ETH you deposited to mint the option.
        </StyledText>
        <StyledSpacer size={24} />

        <StyledSubtitle>
          What are the main advantages of using options on Primitive?
        </StyledSubtitle>
        <StyledSpacer size={24} />
        <StyledText>
          - Increased Security - Contracts are physically settled and do not
          rely on oracles - No special permissions given to any other contract
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          Flash loan capability - The underlying collateral can be temporarily
          borrowed to exercise an option, rather than having to put up the
          capital required upfront to do so
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          Permissionless - Anyone can create any option on any standard ERC-20
        </StyledText>
        <StyledSpacer size={24} />

        <StyledSubtitle>What are the risks involved?</StyledSubtitle>
        <StyledSpacer size={24} />
        <StyledText>
          Please see our Risks page for more information:{' '}
          <Link href={'/risks'}>
            <StyledNavItem>Risks using Primitive Finance</StyledNavItem>
          </Link>
        </StyledText>
        <StyledSpacer size={24} />

        <StyledText>
          For a more detailed version of the FAQ, please refer to the Primitive
          Overview document:{' '}
          <Link
            href={
              'https://www.notion.so/primitivefi/Oracle-less-Option-Tokens-f8efc83405c74ef89c3c274ebb6c34e4'
            }
          >
            <StyledNavItem>Oracle-less Option Tokens</StyledNavItem>
          </Link>
        </StyledText>
        <StyledSpacer size={24} />
      </StyledFAQ>
    </>
  )
}

const StyledNavItem = styled.span`
  color: ${(props) => props.theme.color.grey[300]};
  cursor: pointer;
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.color.white};
  }
`

interface StyledSpacerProps {
  size: number
}

const StyledSpacer = styled.div<StyledSpacerProps>`
  height: ${(props) => props.size}px;
  min-height: ${(props) => props.size}px;
  min-width: ${(props) => props.size}px;
  width: ${(props) => props.size}px;
`

const StyledTitle = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: ${(props) => props.theme.color.white};
`

const StyledSubtitle = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: ${(props) => props.theme.color.grey[400]};
`

const StyledText = styled.div`
  font-size: 18px;
  color: ${(props) => props.theme.color.grey[400]};
`

const StyledFAQ = styled.div`
  align-items: left;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  width: calc(100vh - ${(props) => (props.theme.barHeight * 2) / 3}px);
`

export default FAQ
