import { QuoteRecord } from './getStatsFromLocalStorage';

const generateQuoteRecord = (date: Date, text: string, wpm: number): QuoteRecord => {
    return {
        date,
        wpm,
        text,
    };
};

export default generateQuoteRecord;
