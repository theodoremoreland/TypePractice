// React
import React from 'react';

// Custom styles
import './Card.css';

interface Props {
    text: string;
    callback: (text: string) => void;
}

export default function CardWrapper({ text, callback }: Props): React.ReactElement {
    return (
        <button
            aria-label="Select following text"
            type="button"
            className="card"
            key={text}
            onClick={() => callback(text)}
        >
            <p className="cardText">{text}</p>
        </button>
    );
}
