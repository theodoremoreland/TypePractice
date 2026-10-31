import inspirationalQuotes, { Quote } from '../data/inspirational-quotes';

/**
 * Returns a randomized list of 6 inspirational quotes.
 */
export default (): Quote[] => {
    const randomInspirationalQuotes: Quote[] = [];

    for (let i = 0; i < 6; i++) {
        let randomIndex: number = Math.floor(Math.random() * inspirationalQuotes.length);
        let randomInspirationalQuote: Quote = inspirationalQuotes[randomIndex];

        while (randomInspirationalQuotes.includes(randomInspirationalQuote)) {
            randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
            randomInspirationalQuote = inspirationalQuotes[randomIndex];
        }

        randomInspirationalQuotes.push(randomInspirationalQuote);
    }

    return randomInspirationalQuotes;
};
