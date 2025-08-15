// React
import React, { useState, useEffect, useRef, ReactElement, useReducer, useCallback } from 'react';

// Third party
import { useQuery } from '@tanstack/react-query';

// Custom
import { fetchRandomQuotes } from './api_calls/fetchRandomQuotes';
import extractErrorMessage from './utils/extractErrorMessage';
import selectRandomInspirationalQuotes from './modules/selectRandomInspirationalQuotes';

// Custom components
import Card from './components/Card/Card';
import Input from './components/Input/Input';
import Timer from './components/Timer/Timer';
import Button from './components/Button/Button';

// Controller
import { GameActionType, gameReducer, initialGameState, updateDocumentTitle } from './App.controller';

// Custom styles
import './reset.css';
import './App.css';

const App = (): ReactElement => {
    // Refs
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const appContainerRef = useRef<HTMLElement | null>(null);

    // Game state
    const [gameState, gameDispatch] = useReducer(gameReducer, initialGameState);

    // App state
    const [availableQuotes, setAvailableQuotes] = useState<string[]>([]);
    const [isWaitingOnUserToChooseQuote, setIsWaitingOnUserToChooseQuote] = useState<boolean>(false);

    const { data, isError, refetch } = useQuery({
        queryKey: ['quotes'],
        queryFn: fetchRandomQuotes,
        onError: (err: unknown) => console.error(extractErrorMessage(err)),
        cacheTime: 300_000,
        staleTime: 240_000,
        retry: false,
        enabled: true,
    });

    const chooseQuote = useCallback((selectedQuote: string) => {
        gameDispatch({ type: GameActionType.Start, targetText: selectedQuote.replace(/[’]/g, "'") });
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
        if (data) {
            gameDispatch({ type: GameActionType.Clear });
            setAvailableQuotes(data);
        }
    }, [data]);

    useEffect(() => {
        if (isError) {
            setAvailableQuotes(selectRandomInspirationalQuotes());
        }
    }, [isError]);

    useEffect(() => {
        setIsWaitingOnUserToChooseQuote(true);
    }, [availableQuotes]);

    useEffect(() => {
        if (gameState.isVictory === true) {
            updateDocumentTitle('Finished!');
        } else {
            updateDocumentTitle('Type Practice');
        }
    }, [gameState.isVictory]);

    useEffect(() => {
        const hasUserCompletedText: boolean =
            gameState.typedText.replace(/\n/g, ' ') === gameState.targetText && gameState.targetText !== '';
        const hasUserDeletedCharAfterCompletingText: boolean =
            gameState.typedText.length < gameState.targetText.length && gameState.isVictory === true;

        if (hasUserCompletedText) {
            gameDispatch({ type: GameActionType.Finish });
        } else if (hasUserDeletedCharAfterCompletingText) {
            // This is a fallback for restarting game upon deleting a character after completing a quote if the user device does not have the Backspace key.
            gameDispatch({ type: GameActionType.Restart });
        }
    }, [gameState.typedText, gameState.targetText, gameState.isVictory]);

    useEffect(() => {
        if (gameState.targetText) {
            setIsWaitingOnUserToChooseQuote(false);

            window.scrollTo(0, 0);

            inputRef?.current?.focus();
        }
    }, [gameState.targetText]);

    return (
        <main className="app" ref={appContainerRef}>
            {isWaitingOnUserToChooseQuote && <div className="backdrop" />}
            <Timer timerIsOn={gameState.timerIsOn} delta={gameState.targetText} />
            <header className="header">
                <h1 className="appTitle">Type Practice</h1>
                <p className="gameStatus">
                    {gameState.isVictory &&
                        gameState.totalTime &&
                        `Finished in ${new Intl.NumberFormat().format(gameState.totalTime)}ms @ ${Math.floor(
                            gameState.targetText.split(' ').length / (gameState.totalTime / 1000 / 60),
                        )}WPM`}
                </p>
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
                        <Button
                            key={'Refresh'}
                            text={'Refresh'}
                            callback={async () => {
                                await refetch();
                                gameDispatch({ type: GameActionType.Clear });
                            }}
                        />
                    </div>
                    {availableQuotes.map((quote: string) => (
                        <Card key={quote} text={quote} callback={chooseQuote} />
                    ))}
                </div>
            )}
        </main>
    );
};

export default App;
