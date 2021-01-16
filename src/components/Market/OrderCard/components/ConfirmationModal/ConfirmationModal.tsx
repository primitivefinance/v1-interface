import React, { useCallback, useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import Modal from '@/components/Modal'
import Box from '@/components/Box'
import ClearIcon from '@material-ui/icons/Clear'
import { useWeb3React } from '@web3-react/core'
import Button from '@/components/Button'
import CardContent from '@/components/CardContent'
import CardTitle from '@/components/CardTitle'
import Spacer from '@/components/Spacer'
import Card from '@/components/Card'
import Loader from '@/components/Loader'

interface ConfirmationModalContentProps {
  onDismiss: () => void
  content: () => React.ReactNode
}

const ConfirmationModalContent: React.FC<ConfirmationModalContentProps> = ({
  children,
  onDismiss,
  content,
}) => {
  return (
    <StyledContainer>
      <StyledCard border borderRadius={18}>
        <CardTitle>
          <StyledTitle></StyledTitle>
          <Button variant="tertiary" size="sm" onClick={onDismiss}>
            <ClearIcon />
          </Button>
        </CardTitle>
        <CardContent>
          <StyledContent>{content()}</StyledContent>
        </CardContent>
      </StyledCard>
    </StyledContainer>
  )
}

interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onDismiss,
  hash,
  content,
  attemptingTxn,
  pendingText,
}) => {
  const [err, setErr] = useState(false)
  const Content = useCallback(
    () =>
      !err ? (
        <>
          <Loader
            text={pendingText ? pendingText : 'Waiting for Confirmation'}
          />
          <Spacer />
        </>
      ) : (
        <>
          <StyledErrorTitle>Transaction rejected.</StyledErrorTitle>
          <Spacer />
          <Spacer />
          <StyledButtonContainer>
            <Button variant="default" size="sm" onClick={() => {}} full>
              Dismiss
            </Button>
          </StyledButtonContainer>
        </>
      ),
    [err, setErr]
  )
  if (!isOpen) {
    return null
  }
  return (
    <Container>
      <ConfirmationModalContent content={Content} onDismiss={onDismiss} />
    </Container>
  )
}

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`

const StyledTitle = styled.span`
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: row;
  color: ${(props) => props.theme.color.black};
  width: 100%;
  font-weight: 600;
  font-size: 20px;
`

const StyledErrorTitle = styled(StyledTitle)`
  color: ${(props) => props.theme.color.red[600]};
`

const StyledContainer = styled.div`
  width: 25em;
`

const StyledCard = styled(Card)`
  background: ${(props) => props.theme.color.white};
  border: 1px solid ${(props) => props.theme.color.white};
  border-radius: 18px;
  overflow: hidden;
`
const StyledContent = styled.span`
  margin: 0.5em 1em 0.5em 1em;
  color: ${(props) => props.theme.color.grey[900]};
  width: inherit;
`

const Container = styled.div`
  left: 50%;
  margin: 0 auto;
  max-width: 30em !important;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 200;
`

export default ConfirmationModal
