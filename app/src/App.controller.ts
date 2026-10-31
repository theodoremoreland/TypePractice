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
    finishTime: Date;
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
    finishDate: Date | null;
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
    finishDate: null,
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
            // Don't run this logic if the current game state says it's finished already
            // Prevents recalculating logic due to component re-renders.
            if (gameState.isVictory) {
                return gameState;
            }

            const now: Date = action.finishTime;
            const totalTime: number = now.getTime() - (gameState.startTime as number);

            newGameState.isVictory = true;
            newGameState.timerIsOn = false;
            newGameState.totalTime = totalTime;
            newGameState.finishDate = now;

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
// quoteId, finishDate, targetText, totalTime
export const updateStats = (previousStats: Stats, gameState: GameState): Stats => {
    const stats: Stats = { ...previousStats };
    const quoteId: number = gameState.quoteId as number;

    if (stats.lastProcessed) {
        const lastProcessedDate: Date = new Date(stats.lastProcessed);

        const timeSinceLastProcessed: number = Math.abs(
            lastProcessedDate.getTime() - (gameState.finishDate as Date).getTime(),
        );

        if (timeSinceLastProcessed <= 1000) {
            return stats;
        }
    }

    const totalTime: number = gameState.totalTime as number;
    const finishDate: Date = gameState.finishDate as Date;
    const wpm: number = calculateWordsPerMinute({ type: 'string', value: gameState.targetText }, totalTime);
    const newQuoteEntry: QuoteRecord = generateQuoteRecord(finishDate, gameState.targetText, wpm);

    // History
    if (stats?.history?.[quoteId]) {
        const oldQuoteEntry = stats.history[quoteId];

        if (wpm > oldQuoteEntry.wpm) {
            oldQuoteEntry.wpm = wpm;
            oldQuoteEntry.date = finishDate;
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

    // Previous
    if (new Date(stats.today.date).toLocaleDateString() === finishDate.toLocaleDateString()) {
        stats.today.quoteRecords.push(newQuoteEntry);
    } else {
        stats.today.date = finishDate;
        stats.today.quoteRecords.push(newQuoteEntry);
    }

    stats.attempts = stats.attempts + 1;
    stats.totals.ms += totalTime;
    stats.totals.words += gameState.targetText.split(' ').length;
    stats.previous = wpm;
    stats.lastProcessed = gameState.finishDate as Date;

    return stats;
};
