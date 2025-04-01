const App = () => {
    const [participants, setParticipants] = React.useState([]);
    const [recipients, setRecipients] = React.useState([]);
    const [newParticipant, setNewParticipant] = React.useState('');

    const addParticipant = () => {
        if(newParticipant.trim()) {
            setParticipants([...participants, newParticipant.trim()]);
            setNewParticipant('');
        }
    };

    const handleInputChange = (e) => {
        setNewParticipant(e.target.value);
    };

    const handleKeyPress = (e) => {
        if(e.key === 'Enter') {
            addParticipant();
        }
    };

    const randomizeRecipients = () => {
        if(participants.length < 2) {
            alert('Please add at least two participants!');
            return;
        }
        
        // Create a copy of participants to shuffle
        const shuffled = [...participants];
        let currentIndex = shuffled.length;
        let randomIndex;
        
        // Fisher-Yates shuffle algorithm
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
        }
        
        // Make sure no one is assigned to themselves
        let valid = true;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i] === shuffled[i]) {
                valid = false;
                break;
            }
        }
        
        if (!valid) {
            // Try again if invalid (someone got themselves)
            randomizeRecipients();
            return;
        }
        
        // Create recipient pairs
        const pairs = participants.map((giver, index) => ({
            giver,
            receiver: shuffled[index]
        }));
        
        setRecipients(pairs);
    };

    return React.createElement('div', { className: 'app' },
        React.createElement('h1', null, 'Gift Exchange App'),
        React.createElement('div', { className: 'add-participant' },
            React.createElement('h2', null, 'Add Participants'),
            React.createElement('div', { className: 'input-group' },
                React.createElement('input', {
                    type: 'text',
                    value: newParticipant,
                    onChange: handleInputChange,
                    onKeyPress: handleKeyPress,
                    placeholder: 'Enter participant name'
                }),
                React.createElement('button', { onClick: addParticipant }, 'Add')
            )
        ),
        React.createElement('div', { className: 'generate-button' },
            React.createElement('button', 
                { 
                    onClick: randomizeRecipients,
                    disabled: participants.length < 2
                }, 
                'Generate Gift Exchange'
            )
        ),
        React.createElement('div', { className: 'participant-list' },
            React.createElement('h2', null, 'Participants:'),
            participants.length === 0 
                ? React.createElement('p', null, 'No participants added yet.')
                : React.createElement('ul', null, 
                    participants.map((participant, index) => 
                        React.createElement('li', { key: index }, participant)
                    )
                )
        ),
        recipients.length > 0 && React.createElement('div', { className: 'recipient-list' },
            React.createElement('h2', null, 'Gift Exchange Assignments:'),
            React.createElement('ul', null,
                recipients.map((pair, index) => 
                    React.createElement('li', { key: index }, 
                        `${pair.giver} → ${pair.receiver}`
                    )
                )
            )
        )
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
