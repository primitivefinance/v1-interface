import React, { useEffect } from 'react'
import styled from 'styled-components'

import Spacer from '@/components/Spacer'
import Contracts from '@/components/Contracts'

import Link from 'next/link'

const Risks: React.FC = () => {
  const auditLink = 'https://blog.openzeppelin.com/primitive-audit/'
  const liquidityGuide =
    'https://www.notion.so/primitivefi/Liquidity-Providers-Guide-c06554542f0b4318a2013bbc555d2fc8'
  return (
    <StyledRisks>
      <StyledSpacer size={48} />
      <StyledContainer>
        <StyledTitle>Risks of Using Primitive Finance</StyledTitle>
        <StyledSpacer size={24} />
        <StyledText>
          There are smart contract and economic risks in every interaction with
          the protocol.
        </StyledText>
        <StyledSpacer size={24} />

        <StyledSubtitle>Admin Keys</StyledSubtitle>
        <StyledSpacer size={24} />
        <StyledText>
          The Primitive V1 Option token contract has no admin functions. Every
          Externally Owned Account and smart contract has the same permission
          status. The core Option token contract cannot be paused or changed.
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          The Primitive Option Factory contract has an admin-controlled function
          to pause FUTURE deployments of Options. This will only be in the first
          Option Factory contract, and will be removed after the contracts have
          been battle-tested for several months. The factory has no control over
          Options which have already been deployed.
        </StyledText>
        <StyledSpacer size={24} />

        <StyledSubtitle>Security Audit</StyledSubtitle>
        <StyledSpacer size={24} />
        <StyledText>
          Primitive's core contracts have been audited:{' '}
          <Link href={auditLink}>
            <StyledNavItem>Phase 1 Audit.</StyledNavItem>
          </Link>
          <Spacer size="sm" />
          <Contracts />
          <Spacer />
          Audits do not guarantee security of the contracts. The contracts
          should never be considered 100% secure.
        </StyledText>
        <StyledSpacer size={24} />

        <StyledSubtitle>Development Cycle</StyledSubtitle>
        <StyledSpacer size={24} />
        <StyledText>
          Contracts are first designed and implemented as prototypes. These
          prototypes will never see mainnet.
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          After the prototyping stage, the contracts are upgraded with
          improvements and deployed to a testnet. Contracts will live and be
          redeployed to testnet prior to being sent for audit.
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          The code is then frozen and the contracts are sent to auditors. After
          the auditors have taken several weeks to review them, they will
          recommend changes which are then implemented by the core Primitive
          developers.
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          After the audit changes have been implemented, the core Primitive team
          reviews the overall security and preparedness for maintaining the
          production contracts. Once the team has decided that the contracts are
          ready, they are deployed to mainnet.
        </StyledText>
        <StyledSpacer size={24} />

        <StyledSubtitle>Liquidity Provision Risks</StyledSubtitle>
        <StyledSpacer size={24} />
        <StyledText>
          Please visit our guide for providing liquidity to the Primitive
          protocol:
          <Link href={liquidityGuide}>
            <StyledNavItem> Liquidity Providers Guide</StyledNavItem>
          </Link>
          . Options are volatile instruments, which means losses can accrue
          quicker when they are provided as liquidity to Automated Market
          Makers, such as Uniswap.
        </StyledText>
        <StyledSpacer size={24} />

        <StyledSubtitle>Non-Standard ERC-20 Risks</StyledSubtitle>
        <StyledSpacer size={24} />
        <StyledText>
          The Primitive V1 Option uses a novel accounting method for tracking
          its internal balances. Non-standard ERC-20 token implementations with
          rebase functions (YAM, AMPL, etc.) alter balances, which could break
          the core internal accounting methods. Rebasing tokens have not been
          verified as a secure asset to use as an underlying token in a
          Primitive V1 Option.
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          ERC-20 tokens which have fees taken out on transfer (deflationary) can
          alter balances, which could break the internal accounting methods of
          the Primitive V1 Option.
        </StyledText>
        <StyledSpacer size={24} />
        <StyledText>
          Some ERC-20 implementations do not return true or false, or any data,
          after a transfer method has been completed. Primitive V1 Option has
          safety mechanisms (Open Zeppelin's SafeERC20 Library) in place to
          guard against any side-effects of this non-standard ERC-20 function.
        </StyledText>
        <StyledSpacer size={24} />
        <StyledSpacer size={24} />
      </StyledContainer>
    </StyledRisks>
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
const StyledContainer = styled.div`
  width: 100%;
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

const StyledRisks = styled.div`
  align-items: left;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${(props) => props.theme.barHeight * 2}px);
  max-width: 1000px;
  margin: 0 2em 0 2em;
`

export default Risks
