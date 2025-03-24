import React, { useState } from 'react';
import randomize from '../utils/randomize';

const GenerateList = ({ participants }) => {
    const [results, setResults] = useState([]);

    const handleGenerateList = () => {
        const randomizedResults = randomize(participants);
        setResults(randomizedResults);
    };

    return (
        <div>
            <button onClick={handleGenerateList} disabled={participants.length === 0}>
                Generate Gift Exchange List
            </button>
            {results.length > 0 && (
                <ul>
                    {results.map((recipient, index) => (
                        <li key={index}>{recipient.name} -> {recipient.recipient}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GenerateList;