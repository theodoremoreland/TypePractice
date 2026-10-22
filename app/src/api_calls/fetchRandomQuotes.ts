import { z } from 'zod';

const quoteableSchema = z.object({
    _id: z.string().optional(),
    content: z.string().min(6),
    author: z.string().optional(),
    tags: z.string().array().optional(),
    authorSlug: z.string().optional(),
    length: z.number().optional(),
    dateAdded: z.coerce.date().optional(),
    dateModified: z.coerce.date().optional(),
});

type Quoteable = z.infer<typeof quoteableSchema>;

export const fetchRandomQuotes = async (): Promise<string[]> => {
    const randomizedQuotes: string[] = [];

    do {
        const response: Response = await fetch('https://api.quotable.io/random');
        const json: unknown = await response.json();
        const parsedJson: Quoteable = quoteableSchema.parse(json);
        const quote: string = parsedJson.content;

        if (!randomizedQuotes.includes(quote)) {
            randomizedQuotes.push(quote);
        }
    } while (randomizedQuotes.length < 3);

    return randomizedQuotes;
};
