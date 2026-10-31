export enum StatsKey {
    Today = 'today',
    Previous = 'previous',
    Attempts = 'attempts',
    History = 'history',
    Totals = 'totals',
}

export type QuoteRecord = {
    text: string;
    wpm: number;
    date: Date;
};

export type QuoteHistory = {
    [id: number]: QuoteRecord;
};

export type Totals = {
    words: number;
    ms: number;
};

export type Today = {
    date: Date;
    quoteRecords: QuoteRecord[];
};

export interface Stats {
    /** Record of all quotes completed today. */
    [StatsKey.Today]: Today;
    /** Most recent wpm completed. */
    [StatsKey.Previous]: number;
    /** Number of completed attempts. */
    [StatsKey.Attempts]: number;
    /** Total words typed and total time to complete tests. */
    [StatsKey.Totals]: Totals;
    /** High scores for completed quotes. */
    [StatsKey.History]: QuoteHistory | null;
}

const getStatsFromLocalStorage = (): Stats => {
    const today = new Date();

    try {
        const _stats = localStorage.getItem('stats') as string;
        const stats = JSON.parse(_stats) as Stats;

        if (!stats.today || !stats.today.date) {
            stats[StatsKey.Today] = {
                date: new Date(),
                quoteRecords: [],
            };
        } else if (new Date(stats.today.date).toLocaleDateString() !== today.toLocaleDateString()) {
            stats[StatsKey.Today] = {
                date: new Date(),
                quoteRecords: [],
            };
        }

        return stats;
    } catch (error) {
        console.warn(error);
        localStorage.clear();

        const newStats: Stats = {
            today: {
                date: new Date(),
                quoteRecords: [],
            },
            totals: {
                words: 0,
                ms: 0,
            },
            previous: 0,
            attempts: 0,
            history: null,
        };

        return newStats;
    }
};

export default getStatsFromLocalStorage;
