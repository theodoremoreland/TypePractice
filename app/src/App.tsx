// React
import React, { useState, useEffect, useRef, ReactElement, useReducer, useCallback } from 'react';

// Custom
import { Quote } from './data/inspirational-quotes';
import selectRandomInspirationalQuotes from './modules/selectRandomInspirationalQuotes';
import getStatsFromLocalStorage, { Stats } from './utils/getStatsFromLocalStorage';
import StatsSummary from './components/StatsSummary/StatsSummary';

// Custom components
import Card from './components/Card/Card';
import Input from './components/Input/Input';
import Timer from './components/Timer/Timer';
import Button from './components/Button/Button';

// Controller
import { GameActionType, gameReducer, initialGameState, updateDocumentTitle, updateStats } from './App.controller';

// Custom styles
import './reset.css';
import './App.css';

const initialStats = getStatsFromLocalStorage();

const App = (): ReactElement => {
    // Refs
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const appContainerRef = useRef<HTMLElement | null>(null);

    // Game state
    const [gameState, gameDispatch] = useReducer(gameReducer, initialGameState);
    const [stats, setStats] = useState<Stats>(initialStats);

    // App state
    const [availableQuotes, setAvailableQuotes] = useState<Quote[]>(selectRandomInspirationalQuotes());
    const [isWaitingOnUserToChooseQuote, setIsWaitingOnUserToChooseQuote] = useState<boolean>(false);

    const chooseQuote = useCallback((selectedQuote: Quote) => {
        gameDispatch({
            type: GameActionType.Start,
            quoteId: selectedQuote.id,
            targetText: selectedQuote.text.replace(/[’]/g, "'"),
        });

        window.scrollTo(0, 0);

        inputRef?.current?.focus();
    }, []);

    /** Checks for delete after completing quote, will restart game if so. */
    const onKeyUp = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.code === 'Backspace' && gameState.isVictory) {
                gameDispatch({ type: GameActionType.Restart });
            }
        },
        [gameState.isVictory],
    );

    useEffect(() => {
        if (availableQuotes.length === 0) {
            gameDispatch({ type: GameActionType.Clear });
            setAvailableQuotes(selectRandomInspirationalQuotes());
        }

        setIsWaitingOnUserToChooseQuote(true);
    }, [availableQuotes]);

    useEffect(() => {
        if (gameState.isVictory === true) {
            setStats((prev) => updateStats(prev, gameState));
            updateDocumentTitle('Finished!');
        } else {
            updateDocumentTitle('Type Practice');
        }
    }, [gameState.isVictory]);

    useEffect(() => {
        if (stats) {
            localStorage.setItem('stats', JSON.stringify(stats));
        }
    }, [stats]);

    useEffect(() => {
        const hasUserCompletedText: boolean =
            gameState.typedText.replace(/\n/g, ' ') === gameState.targetText &&
            gameState.targetText !== '' &&
            gameState.isVictory !== true;
        const hasUserDeletedCharAfterCompletingText: boolean =
            gameState.typedText.length < gameState.targetText.length && gameState.isVictory === true;

        if (hasUserCompletedText) {
            gameDispatch({ type: GameActionType.Finish, finishTime: new Date() });
        } else if (hasUserDeletedCharAfterCompletingText) {
            // This is a fallback for restarting game upon deleting a character after completing a quote if the user device does not have the Backspace key.
            gameDispatch({ type: GameActionType.Restart });
        }
    }, [gameState.typedText, gameState.targetText, gameState.isVictory]);

    useEffect(() => {
        if (gameState.targetText) {
            setIsWaitingOnUserToChooseQuote(false);
        }
    }, [gameState.targetText]);

    return (
        <main className="app" ref={appContainerRef}>
            {isWaitingOnUserToChooseQuote && <div className="backdrop" />}
            <Timer timerIsOn={gameState.timerIsOn} delta={gameState.targetText} />
            {gameState.isVictory && gameState.totalTime && (
                <p className="gameStatus">
                    {`${new Intl.NumberFormat().format(gameState.totalTime / 1000)}s @ ${Math.floor(
                        gameState.targetText.split(' ').length / (gameState.totalTime / 1000 / 60),
                    )}wpm`}
                </p>
            )}
            <header className="header">
                <h1 className="appTitle">
                    <a
                        title="View source code"
                        href="https://github.com/theodoremoreland/TypePractice"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Type Practice
                    </a>
                </h1>
                <StatsSummary stats={stats} />
            </header>
            <div className="panel">
                <div className={`${isWaitingOnUserToChooseQuote ? 'waiting-on-user-to-choose-quote' : ''} description`}>
                    Practice your typing speed while reading words of wisdom by choosing a quote below. If the quotes
                    below do not interest you, you can click the Refresh button to receive a new list of quotes. Once a
                    quote is selected, you will be timed on how quickly you can type your selection. After completing,
                    you can press the Backspace key on your keyboard to retry the same quote. Alternatively, you can
                    choose a different quote to be timed on.
                </div>
                <Input
                    foregroundText={gameState.typedText}
                    callback={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        gameDispatch({ type: GameActionType.Continue, typedText: e.target.value })
                    }
                    inputRef={inputRef}
                    backgroundText={gameState.targetText}
                    onKeyUp={onKeyUp}
                />
            </div>
            {availableQuotes.length > 0 && (
                <div className={`${isWaitingOnUserToChooseQuote ? 'waiting-on-user-to-choose-quote' : ''} cardGroup`}>
                    <div className="groupHeader">
                        <h3>Choose a quote or</h3>
                        <Button key={'Refresh'} text="REFRESH" callback={() => setAvailableQuotes([])} />
                    </div>
                    {availableQuotes.map((quote: Quote) => (
                        <Card key={quote.id} quote={quote} callback={chooseQuote} />
                    ))}
                </div>
            )}
        </main>
    );
};

export default App;
