// React
import React from 'react';

// Custom styles
import './Button.css';

interface Props {
    text: string;
    callback: () => unknown;
}

export default function ButtonWrapper({ text, callback }: Props): React.ReactElement {
    return (
        <button key={text} className="button" onClick={() => callback()}>
            {text}
        </button>
    );
}
