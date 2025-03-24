import React, { useState } from 'react';
import AddParticipants from './components/AddParticipants';
import GenerateList from './components/GenerateList';
import ParticipantList from './components/ParticipantList';
import { randomizeRecipients } from './utils/randomize';

const App = () => {
    const [participants, setParticipants] = useState([]);
    const [recipients, setRecipients] = useState([]);

    const addParticipant = (name) => {
        setParticipants([...participants, name]);
    };

    const generateRecipients = () => {
        const randomized = randomizeRecipients(participants);
        setRecipients(randomized);
    };

    return (
        <div className="app">
            <h1>Gift Exchange App</h1>
            <AddParticipants addParticipant={addParticipant} />
            <GenerateList generateRecipients={generateRecipients} />
            <ParticipantList participants={participants} recipients={recipients} />
        </div>
    );
};

export default App;