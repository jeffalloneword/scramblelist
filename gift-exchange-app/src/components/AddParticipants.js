import React, { useState } from 'react';

const AddParticipants = ({ participants, setParticipants }) => {
    const [name, setName] = useState('');

    const handleAddParticipant = (e) => {
        e.preventDefault();
        if (name.trim() !== '') {
            setParticipants([...participants, name]);
            setName('');
        }
    };

    return (
        <div>
            <h2>Add Participants</h2>
            <form onSubmit={handleAddParticipant}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter participant name"
                    required
                />
                <button type="submit">Add</button>
            </form>
        </div>
    );
};

export default AddParticipants;