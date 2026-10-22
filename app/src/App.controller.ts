// HTTP requests
import { fetchRandomQuotes } from './api_calls/fetchRandomQuotes';

// Utils & Scripts
import extractErrorMessage from './utils/extractErrorMessage';
import selectRandomInspirationalQuotes from './modules/selectRandomInspirationalQuotes';

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
}

export interface GameContinueAction {
    type: GameActionType.Continue;
    typedText: string;
}

export interface GameFinishAction {
    type: GameActionType.Finish;
}

export interface GameRestartAction {
    type: GameActionType.Restart;
}

export interface GameClearAction {
    type: GameActionType.Clear;
}

export type GameAction = GameStartAction | GameContinueAction | GameFinishAction | GameRestartAction | GameClearAction;

export interface GameState {
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
            newGameState.isVictory = true;
            newGameState.timerIsOn = false;
            newGameState.totalTime = new Date().getTime() - (gameState.startTime as number);

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

export const getRandomQuotes = async (): Promise<string[]> => {
    let randomQuotes: string[];

    try {
        randomQuotes = await fetchRandomQuotes();
    } catch (error) {
        console.error(extractErrorMessage(error));

        randomQuotes = selectRandomInspirationalQuotes();
    }

    return randomQuotes;
};
