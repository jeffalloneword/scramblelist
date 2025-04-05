document.addEventListener('DOMContentLoaded', () => {
    // No authentication needed - using localStorage directly
    console.log("Using localStorage for data persistence");

    // Initialize localStorage data structure if it doesn't exist
    if (!localStorage.getItem('scramblelist_participants')) {
        localStorage.setItem('scramblelist_participants', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('scramblelist_exchanges')) {
        localStorage.setItem('scramblelist_exchanges', JSON.stringify([]));
    }
    
    // Helper functions for localStorage data
    window.storageHelper = {
        // Get all participants from localStorage
        getParticipants: function() {
            const data = localStorage.getItem('scramblelist_participants');
            return data ? JSON.parse(data) : [];
        },
        
        // Save participants to localStorage
        saveParticipants: function(participants) {
            localStorage.setItem('scramblelist_participants', JSON.stringify(participants));
        },
        
        // Add a participant to localStorage
        addParticipant: function(name, email) {
            const participants = this.getParticipants();
            const newId = participants.length ? Math.max(...participants.map(p => p.id)) + 1 : 1;
            const newParticipant = {
                id: newId,
                name: name,
                email: email || null,
                created_at: new Date().toISOString()
            };
            participants.push(newParticipant);
            this.saveParticipants(participants);
            return newParticipant;
        },
        
        // Get all exchanges from localStorage
        getExchanges: function() {
            const data = localStorage.getItem('scramblelist_exchanges');
            return data ? JSON.parse(data) : [];
        },
        
        // Save exchanges to localStorage
        saveExchanges: function(exchanges) {
            localStorage.setItem('scramblelist_exchanges', JSON.stringify(exchanges));
        },
        
        // Add an exchange to localStorage
        addExchange: function(title, description, participants, assignments) {
            const exchanges = this.getExchanges();
            const newId = exchanges.length ? Math.max(...exchanges.map(e => e.id)) + 1 : 1;
            const newExchange = {
                id: newId,
                title: title,
                description: description || null,
                created_at: new Date().toISOString(),
                participants: participants,
                assignments: assignments
            };
            exchanges.push(newExchange);
            this.saveExchanges(exchanges);
            return newExchange;
        },
        
        // Get exchange by ID
        getExchangeById: function(id) {
            const exchanges = this.getExchanges();
            return exchanges.find(e => e.id === parseInt(id)) || null;
        },
        
        // Clear all participants
        clearParticipants: function() {
            this.saveParticipants([]);
        },
        
        // Remove specific participant by ID
        removeParticipant: function(participantId) {
            const participants = this.getParticipants();
            const filteredParticipants = participants.filter(p => p.id !== participantId);
            this.saveParticipants(filteredParticipants);
            return filteredParticipants;
        }
    };

    // DOM elements
    const addParticipantForm = document.getElementById('add-participant-form');
    const participantList = document.getElementById('participant-list');
    const createExchangeForm = document.getElementById('create-exchange-form');
    const generateBtn = document.getElementById('generate-btn');
    const resultsSection = document.getElementById('results-section');
    const assignmentsList = document.getElementById('assignments-list');
    const resultsTitle = document.getElementById('results-title');
    const dbStatus = document.getElementById('database-status');
    const spinnerOverlay = document.getElementById('spinner-overlay');

    
    // Make sure spinner is hidden on page load
    if (spinnerOverlay) {
        spinnerOverlay.classList.add('hidden');
    }
    
    // Only proceed with app initialization if we have all the necessary elements
    if (addParticipantForm && participantList) {
        // Check database connection
        checkDatabaseConnection();
        
        // Initialize the participants table and only load past exchanges initially
        setupDatabase().then(() => {
            // Initialize with empty participant list
            // No past exchanges functionality
            
            // Show empty list with control buttons
            clearParticipantsList();
        }).catch(error => {
            console.error('Error during database setup:', error);
        });
        
        // Event Listeners
        addParticipantForm.addEventListener('submit', handleAddParticipant);
        createExchangeForm.addEventListener('submit', handleCreateExchange);
    }
    
    // Functions
    async function checkDatabaseConnection() {
        try {
            // Use localStorage status instead of database
            dbStatus.textContent = `Using localStorage | ${formatDate(new Date().toISOString())}`;
            dbStatus.style.color = '#4caf50';
        } catch (error) {
            console.error('Error checking localStorage:', error);
            dbStatus.textContent = 'Error with localStorage';
            dbStatus.style.color = '#d33';
        }
    }
    
    async function setupDatabase() {
        // No need to set up a database, we're using localStorage
        console.log('localStorage initialized');
    }
    
    async function loadParticipants() {
        try {
            // Get participants from localStorage instead of API
            const participants = window.storageHelper.getParticipants();
            
            participantList.innerHTML = '';
            
            // Add control buttons at the top - only Clear All button for regular view
            const controls = document.createElement('li');
            controls.classList.add('participant-controls');
            controls.innerHTML = `
                <button id="clear-participants" class="btn mini danger">Clear All</button>
            `;
            participantList.appendChild(controls);
            
            if (participants.length === 0) {
                const emptyMessage = document.createElement('li');
                emptyMessage.classList.add('empty-message');
                emptyMessage.textContent = 'No participants added yet.';
                participantList.appendChild(emptyMessage);
            } else {
                participants.forEach(participant => {
                    const li = document.createElement('li');
                    li.dataset.participantId = participant.id;
                    li.innerHTML = `
                        <span>${participant.name}${participant.email ? ` (${participant.email})` : ''}</span>
                        <button class="remove-participant btn mini danger">✕</button>
                    `;
                    participantList.appendChild(li);
                    
                    // Add event listener for removing this participant
                    li.querySelector('.remove-participant').addEventListener('click', function(e) {
                        e.stopPropagation();
                        // Remove this participant by ID
                        window.storageHelper.removeParticipant(participant.id);
                        // Reload the participants list to reflect changes
                        loadParticipants();
                    });
                });
            }
            
            // Add event listeners for the control buttons
            document.getElementById('clear-participants').addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event from bubbling up
                // Clear participants in localStorage
                window.storageHelper.clearParticipants();
                clearParticipantsList();
            });
        } catch (error) {
            console.error('Error loading participants from localStorage:', error);
            participantList.innerHTML = '';
            const errorMessage = document.createElement('li');
            errorMessage.classList.add('empty-message', 'error-message');
            errorMessage.textContent = 'Error loading participants';
            participantList.appendChild(errorMessage);
            
            // Still add the control buttons
            const controls = document.createElement('li');
            controls.classList.add('participant-controls');
            controls.innerHTML = `
                <button id="clear-participants" class="btn mini danger">Clear All</button>
            `;
            
            // Insert at the beginning
            participantList.insertBefore(controls, participantList.firstChild);
            
            // Add event listeners for the control buttons
            document.getElementById('clear-participants').addEventListener('click', function(e) {
                e.stopPropagation();
                // Clear participants in localStorage
                window.storageHelper.clearParticipants();
                clearParticipantsList();
            });
        }
    }
    
    async function handleAddParticipant(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        
        if (!name.trim()) {
            alert('Name is required');
            return;
        }
        
        try {
            // Add participant to localStorage directly
            window.storageHelper.addParticipant(name, '');
            
            // Clear the form
            document.getElementById('name').value = '';
            
            // Reload participants
            loadParticipants();
        } catch (error) {
            console.error('Error adding participant:', error);
            alert('Failed to add participant');
        }
    }
    
    async function handleCreateExchange(e) {
        e.preventDefault();
        
        const title = document.getElementById('exchange-title').value;
        const description = document.getElementById('exchange-description').value;
        
        if (!title.trim()) {
            alert('Title is required');
            return;
        }
        
        try {
            // Get participants from localStorage
            const participants = window.storageHelper.getParticipants();
            
            if (participants.length < 2) {
                alert('Need at least 2 participants to create an exchange');
                return;
            }
            
            // Show the loading spinner
            spinnerOverlay.classList.remove('hidden');
            
            // Shuffle participants and ensure no one gets themselves
            const assignments = generateRandomAssignments(participants);
            
            // Simulate processing delay for animation (10 seconds)
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Save the exchange to localStorage
            const savedExchange = window.storageHelper.addExchange(
                title,
                description,
                participants,
                assignments
            );
            
            // Hide the spinner
            spinnerOverlay.classList.add('hidden');
            
            // Show the results
            resultsSection.classList.remove('hidden');
            resultsTitle.textContent = title;
            
            // Display assignments
            assignmentsList.innerHTML = '';
            assignments.forEach(assignment => {
                const li = document.createElement('li');
                li.textContent = `${assignment.giver.name} → ${assignment.receiver.name}`;
                assignmentsList.appendChild(li);
            });
            
            // Add exchange ID as a data attribute
            resultsSection.dataset.exchangeId = savedExchange.id;
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            // Hide the spinner in case of error
            spinnerOverlay.classList.add('hidden');
            console.error('Error creating exchange:', error);
            alert('Failed to create exchange: ' + error.message);
        }
    }
    
    function generateRandomAssignments(participants) {
        if (participants.length < 2) return [];
        
        // Create a copy of participants to avoid modifying the original
        const givers = [...participants];
        
        // We'll allocate receivers in a way that ensures no one gets themselves
        let validAssignments = false;
        let assignments = [];
        
        // Keep trying until we get valid assignments
        while (!validAssignments) {
            // Shuffle the array
            const shuffledReceivers = [...givers].sort(() => Math.random() - 0.5);
            
            // Check if any person is their own receiver
            let invalid = false;
            for (let i = 0; i < givers.length; i++) {
                if (givers[i].id === shuffledReceivers[i].id) {
                    invalid = true;
                    break;
                }
            }
            
            if (!invalid) {
                validAssignments = true;
                assignments = givers.map((giver, index) => ({
                    giver,
                    receiver: shuffledReceivers[index]
                }));
            }
        }
        
        return assignments;
    }
    
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    // Helper function to clear participants list but keep control buttons
    function clearParticipantsList() {
        // Clear the list
        participantList.innerHTML = '';
        
        // Add control buttons at the top - only Clear All for empty lists
        const controls = document.createElement('li');
        controls.classList.add('participant-controls');
        controls.innerHTML = `
            <button id="clear-participants" class="btn mini danger">Clear All</button>
        `;
        participantList.appendChild(controls);
        
        // Add empty message
        const emptyMessage = document.createElement('li');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = 'No participants added yet. Add participants above.';
        participantList.appendChild(emptyMessage);
        
        // Add event listeners for the control buttons
        document.getElementById('clear-participants').addEventListener('click', function(e) {
            e.stopPropagation();
            clearParticipantsList();
        });
    }
    
    // Helper function to load participants from a specific exchange
    function loadExchangeParticipants(exchangeId, participants) {
        if (!participants || participants.length === 0) {
            clearParticipantsList();
            return;
        }
        
        participantList.innerHTML = '';
        
        // Add control buttons at the top
        const controls = document.createElement('li');
        controls.classList.add('participant-controls');
        controls.innerHTML = `
            <button id="clear-participants" class="btn mini danger">Clear All</button>
            <button id="load-all-participants" class="btn mini secondary">Load All Participants</button>
        `;
        participantList.appendChild(controls);
        
        // Add participants from this exchange
        participants.forEach(participant => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${participant.name}${participant.email ? ` (${participant.email})` : ''}</span>
                <span class="exchange-reference">From exchange #${exchangeId}</span>
            `;
            participantList.appendChild(li);
        });
        
        // Add a notice that these are participants from a previous exchange
        const notice = document.createElement('li');
        notice.classList.add('exchange-notice');
        notice.innerHTML = '<em>Viewing participants from selected exchange. You can add or remove participants for new exchanges. Each exchange can have different participants.</em>';
        participantList.appendChild(notice);
        
        // Add event listeners for the control buttons
        document.getElementById('clear-participants').addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up
            clearParticipantsList();
        });
        
        document.getElementById('load-all-participants').addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up
            loadParticipants();
        });
    }
    
    async function loadPastExchanges() {
        // Past exchanges functionality has been removed
        // This function is kept for compatibility but does nothing
        console.log("Past exchanges functionality has been removed");
        return;
    }
});