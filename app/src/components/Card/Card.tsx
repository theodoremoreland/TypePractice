// React
import React from 'react';

// Custom
import { Quote } from '../../data/inspirational-quotes';

// Custom styles
import './Card.css';

interface Props {
    quote: Quote;
    callback: (quote: Quote) => void;
}

export default function CardWrapper({ quote, callback }: Props): React.ReactElement {
    return (
        <button
            aria-label="Select following text"
            type="button"
            className="card"
            key={quote.id}
            onClick={() => callback(quote)}
        >
            <p className="cardText">{quote.text}</p>
        </button>
    );
}
