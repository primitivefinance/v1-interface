import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

export interface TimerProps {
  expiry: number
}

const calculateRemainingTime = (expiry) => {
  //let year = new Date().getFullYear();
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

const formatDigits = (number) => {
  let formattedNumber = ('0' + number).slice(-2)
  if (formattedNumber === '0' || formattedNumber === '') {
    return '00'
  }
  return formattedNumber
}

const Timer: React.FC<TimerProps> = (props) => {
  const { expiry } = props
  const [timeLeft, setTimeLeft] = useState(calculateRemainingTime(expiry))

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateRemainingTime(expiry))
    }, 1000)

    return () => clearTimeout(timer)
  })

  const timerComponents: any = []

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval]) {
      return
    }

    timerComponents.push(
      <>
        {interval === 'days'
          ? timeLeft[interval] + 'd'
          : interval === 'hours'
          ? formatDigits(timeLeft[interval]) + 'hr'
          : interval !== 'seconds'
          ? formatDigits(timeLeft[interval]) + 'm'
          : formatDigits(timeLeft[interval])}
        {interval === 'seconds' ? 's' : ':'}
      </>
    )
  })

  return (
    <StyledTimer>
      {timerComponents.length ? timerComponents : <span>Expired</span>}
    </StyledTimer>
  )
}

const StyledTimer = styled.div``

export default Timer
