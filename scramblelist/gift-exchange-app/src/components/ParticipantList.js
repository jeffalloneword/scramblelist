import React from 'react';

const ParticipantList = ({ participants }) => {
    return (
        <div>
            <h2>Gift Exchange Participants</h2>
            <ul>
                {participants.map((participant, index) => (
                    <li key={index}>{participant}</li>
                ))}
            </ul>
        </div>
    );
};

export default ParticipantList;