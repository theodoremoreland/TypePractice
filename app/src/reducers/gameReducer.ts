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
