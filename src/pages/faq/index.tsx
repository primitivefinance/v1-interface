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

        <StyledSubtitle>
          What are the main advantages of using the Primitive protocol?
        </StyledSubtitle>
        <StyledSpacer size={24} />
        <StyledText>
          <strong>Increased Security</strong>: Contracts are physically settled
          and do not rely on oracles. They are autonomous and immutable, no
          entity controls them.
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          <strong>Simplicty</strong>: The core contracts are designed with
          minimal code and minimal reliablility on external systems.
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          <strong>Permissionless</strong>: Anyone can create any option on any
          standard ERC-20
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
          Headquarters documentation page:{' '}
          <Link
            href={
              'https://www.notion.so/primitivefi/Primitive-Protocol-HQ-fc081b939bb04e2a90ccaebf36faa78e'
            }
          >
            <StyledNavItem>Documentation</StyledNavItem>
          </Link>
        </StyledText>
        <StyledSpacer size={24} />
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
  color: ${(props) => props.theme.color.white};
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
