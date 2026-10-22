// React
import React from 'react';

// Custom styles
import './Input.css';

interface Props {
    foregroundText: string;
    callback: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    inputRef: React.MutableRefObject<HTMLTextAreaElement | null>;
    onKeyUp: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    backgroundText: string;
}

export default function InputWrapper({
    foregroundText,
    callback,
    inputRef,
    backgroundText,
    onKeyUp,
}: Props): React.ReactElement {
    return (
        <div className="inputContainer">
            <textarea
                className="input"
                ref={inputRef}
                spellCheck={false}
                value={foregroundText}
                onChange={callback}
                onKeyUp={onKeyUp}
            />
            <textarea className="inputBackdrop" value={backgroundText} readOnly />
        </div>
    );
}
