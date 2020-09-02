import React, { useEffect, useState } from "react";
import styled from "styled-components";

export interface TimerProps {
    expiry: number;
}

const calculateRemainingTime = (expiry) => {
    let year = new Date().getFullYear();
    let difference = +new Date(expiry * 1000) - +new Date();
    let timeLeft: any = {};
    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    return timeLeft;
};

const formatDigits = (number) => {
    if (number == 0) {
        return "00";
    }
    let formattedNumber = ("0" + number).slice(-2);
    return formattedNumber;
};

const Timer: React.FC<TimerProps> = (props) => {
    const { expiry } = props;
    const [timeLeft, setTimeLeft] = useState(calculateRemainingTime(expiry));

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateRemainingTime(expiry));
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents: any = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval]) {
            return;
        }

        timerComponents.push(
            <>
                {interval == "days"
                    ? timeLeft[interval]
                    : formatDigits(timeLeft[interval])}
                {interval == "seconds" ? "" : ":"}
            </>
        );
    });

    return (
        <StyledTimer>
            {timerComponents.length ? timerComponents : <span>Expiring</span>}
        </StyledTimer>
    );
};

const StyledTimer = styled.div``;

export default Timer;
