import inspirationalQuotes from '../data/inspirational-quotes';

/**
 * Returns a randomized list of 6 inspirational quotes.
 */
export default (): string[] => {
    const randomInspirationalQuotes: string[] = [];

    for (let i = 0; i < 6; i++) {
        let randomIndex: number = Math.floor(Math.random() * inspirationalQuotes.length);
        let randomInspirationalQuote: string = inspirationalQuotes[randomIndex].text;

        while (randomInspirationalQuotes.includes(randomInspirationalQuote)) {
            randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
            randomInspirationalQuote = inspirationalQuotes[randomIndex].text;
        }

        randomInspirationalQuotes.push(randomInspirationalQuote);
    }

    return randomInspirationalQuotes;
};
