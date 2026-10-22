// React
import React, { useEffect, useState, useCallback, useRef } from 'react';

// Custom styles
import './Timer.css';

interface Props {
    timerIsOn: boolean;
    delta: unknown;
}

export default function Timer({ timerIsOn, delta }: Props): React.ReactElement {
    // delta = data that triggers useEffect upon change
    // said useEffect resets timer
    const [time, setTime] = useState<number | undefined>(undefined);
    const intervalIdRef = useRef<number>();

    const startTimer = useCallback(() => {
        const newIntervalID: number = setInterval(() => setTime((prevCount) => (prevCount ? prevCount + 1 : 1)), 1_000);

        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
        }

        intervalIdRef.current = newIntervalID;
    }, []);

    useEffect(() => {
        return () => {
            clearInterval(intervalIdRef.current);
            setTime(undefined);

            intervalIdRef.current = undefined;
        };
    }, []);

    /**
     * Executes when timer should start or stop or if delta changes.
     */
    useEffect(() => {
        // If there is data for delta and timer was supposed to start...
        if (delta && timerIsOn) {
            setTime(0);
            startTimer();
        }

        // If timer is supposed to be turned off...
        if (timerIsOn === false) {
            clearInterval(intervalIdRef.current);
            setTime(undefined);

            intervalIdRef.current = undefined;
        }
    }, [delta, timerIsOn, startTimer]);

    return <>{!Number.isNaN(time) ? <p className="timer">{time}</p> : ''}</>;
}
