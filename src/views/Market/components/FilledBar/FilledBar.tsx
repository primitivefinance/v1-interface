import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const calculateRemainingTime = (expiry) => {
  let difference = +new Date(expiry * 1000) - +new Date()
  let timeLeft: any = {}
  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }

  return timeLeft
}

export interface FilledBarProps {
  expiry?: number
}

const FilledBar: React.FC<FilledBarProps> = (props) => {
  const { expiry } = props
  const [timeLeft, setTimeLeft] = useState(calculateRemainingTime(expiry))
  const [remainder, setRemainder] = useState(100)

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateRemainingTime(expiry))
    }, 1000)

    return () => clearTimeout(timer)
  })

  useEffect(() => {
    if (timeLeft.days > 30) {
      return
    } else if (timeLeft.days > 0) {
      setRemainder(85)
    } else if (timeLeft.hours > 0) {
      setRemainder(75)
    } else if (timeLeft.minutes > 0) {
      setRemainder(50)
    } else if (timeLeft.seconds > 0) {
      setRemainder(25)
    } else {
      setRemainder(0)
    }
  }, [timeLeft, remainder, setRemainder])

  return (
    <RemainderContainer>
      <RemainderBlock remainder={remainder}></RemainderBlock>
    </RemainderContainer>
  )
}

interface RemainderBlockProps {
  remainder: number
}

const RemainderBlock = styled.div<RemainderBlockProps>`
  background-color: ${(props) => props.theme.color.percentage[props.remainder]};
  width: ${(props) => props.remainder}%;
  height: 12px;
  border-radius: 8px;
`

const RemainderContainer = styled.div`
  background-color: ${(props) => props.theme.color.grey[600]};
  width: 100%;
  height: 12px;
  border-radius: 8px;
`

export default FilledBar
