// Game
import { GameState } from '../reducers/gameReducer';

// Helpers
import { QuoteRecord, Stats } from './getStatsFromLocalStorage';
import calculateWordsPerMinute from './calculateWordsPerMinute';
import generateQuoteRecord from './generateQuoteRecord';

const updateStats = (previousStats: Stats, gameState: GameState): Stats => {
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

export default updateStats;
