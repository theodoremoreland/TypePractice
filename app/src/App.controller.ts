import { QuoteRecord, Stats } from './utils/getStatsFromLocalStorage';
import calculateWordsPerMinute from './utils/calculateWordsPerMinute';
import generateQuoteRecord from './utils/generateQuoteRecord';

export enum GameActionType {
    Start = 'start',
    Continue = 'continue',
    Finish = 'finish',
    Restart = 'reset',
    Clear = 'clear',
}

export interface GameStartAction {
    type: GameActionType.Start;
    targetText: string;
    quoteId: number;
}

export interface GameContinueAction {
    type: GameActionType.Continue;
    typedText: string;
}

export interface GameFinishAction {
    type: GameActionType.Finish;
    stats: Stats;
}

export interface GameRestartAction {
    type: GameActionType.Restart;
}

export interface GameClearAction {
    type: GameActionType.Clear;
}

export type GameAction = GameStartAction | GameContinueAction | GameFinishAction | GameRestartAction | GameClearAction;

export interface GameState {
    quoteId: number | null;
    typedText: string;
    targetText: string;
    isVictory: boolean;
    timerIsOn: boolean;
    startTime: number | null;
    totalTime: number | null;
}

export interface Genres {
    [key: string]: string[];
}

export const initialGameState: GameState = {
    quoteId: null,
    typedText: '',
    targetText: '',
    isVictory: false,
    timerIsOn: false,
    startTime: null,
    totalTime: null,
};

export const gameReducer = (gameState: GameState, action: GameAction): GameState => {
    const newGameState: GameState = { ...gameState };

    switch (action.type) {
        case GameActionType.Start: {
            newGameState.quoteId = action.quoteId;
            newGameState.typedText = initialGameState.typedText;
            newGameState.targetText = action.targetText;
            newGameState.isVictory = initialGameState.isVictory;
            newGameState.timerIsOn = true;
            newGameState.startTime = new Date().getTime();
            newGameState.totalTime = null;

            break;
        }
        case GameActionType.Continue: {
            // If continuing, everything in game state should be defined, but typed text should update.
            newGameState.typedText = action.typedText;

            break;
        }
        case GameActionType.Finish: {
            const wasPreviousInvocationAVictory: boolean = newGameState.isVictory;
            const quoteId: number = newGameState.quoteId as number;
            const today: Date = new Date();

            newGameState.isVictory = true;
            newGameState.timerIsOn = false;
            newGameState.totalTime = today.getTime() - (gameState.startTime as number);

            const stats: Stats = action.stats;
            const wpm: number = calculateWordsPerMinute(
                { type: 'string', value: newGameState.targetText },
                newGameState.totalTime,
            );
            const newQuoteEntry: QuoteRecord = generateQuoteRecord(today, newGameState.targetText, wpm);

            // History
            if (stats?.history?.[quoteId]) {
                const oldQuoteEntry = stats.history[quoteId];

                if (wpm > oldQuoteEntry.wpm) {
                    oldQuoteEntry.wpm = wpm;
                    oldQuoteEntry.date = today;
                }

                stats.history[quoteId] = oldQuoteEntry;
            } else if (stats.history) {
                stats.history = {
                    ...stats.history,
                    [quoteId]: newQuoteEntry,
                };
            } else {
                stats.history = {
                    [quoteId]: newQuoteEntry,
                };
            }

            // Attempts
            if (!wasPreviousInvocationAVictory) {
                stats.attempts = stats.attempts ? stats.attempts + 1 : 1;
            }

            // Previous
            if (new Date(stats.today.date).toLocaleDateString() === today.toLocaleDateString()) {
                stats.today.quoteRecords.push(newQuoteEntry);
            } else {
                stats.today.date = today;
                stats.today.quoteRecords.push(newQuoteEntry);
            }
            stats.totals.ms += newGameState.totalTime;
            stats.totals.words += newGameState.targetText.split(' ').length;
            stats.previous = wpm;

            localStorage.setItem('stats', JSON.stringify(stats));

            break;
        }
        case GameActionType.Restart: {
            newGameState.isVictory = initialGameState.isVictory;
            newGameState.timerIsOn = true;
            newGameState.typedText = '';
            newGameState.startTime = new Date().getTime();
            newGameState.totalTime = null;

            break;
        }
        case GameActionType.Clear: {
            return initialGameState;
        }
        default: {
            throw new Error('Invalid game action');
        }
    }

    return newGameState;
};

export const updateDocumentTitle = (newTitle: string): void => {
    document.title = newTitle;
};
