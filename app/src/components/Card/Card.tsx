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
        <div className="card" key={text} onClick={() => callback(text)}>
            <p className="cardText">{text}</p>
        </div>
    );
}
