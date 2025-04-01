document.addEventListener('DOMContentLoaded', () => {
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
    spinnerOverlay.classList.add('hidden');
    
    // Check database connection
    checkDatabaseConnection();
    
    // Initialize the participants table and then load participants
    setupDatabase().then(() => {
        // Load participants after database setup is complete
        loadParticipants();
    }).catch(error => {
        console.error('Error during database setup:', error);
    });
    
    // Event Listeners
    addParticipantForm.addEventListener('submit', handleAddParticipant);
    createExchangeForm.addEventListener('submit', handleCreateExchange);
    
    // Functions
    async function checkDatabaseConnection() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            
            if (data.database === 'connected') {
                dbStatus.textContent = `Database connected | ${formatDate(data.timestamp)}`;
                dbStatus.style.color = '#4caf50';
            } else {
                dbStatus.textContent = 'Database not connected';
                dbStatus.style.color = '#d33';
            }
        } catch (error) {
            console.error('Error checking database connection:', error);
            dbStatus.textContent = 'Failed to check database connection';
            dbStatus.style.color = '#d33';
        }
    }
    
    async function setupDatabase() {
        try {
            await fetch('/api/setup');
            console.log('Database setup complete');
        } catch (error) {
            console.error('Error setting up database:', error);
        }
    }
    
    async function loadParticipants() {
        try {
            const response = await fetch('/api/participants');
            const participants = await response.json();
            
            if (participants.length === 0) {
                participantList.innerHTML = '<li class="empty-message">No participants added yet.</li>';
                return;
            }
            
            participantList.innerHTML = '';
            participants.forEach(participant => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${participant.name}${participant.email ? ` (${participant.email})` : ''}</span>
                    <span>${formatDate(participant.created_at)}</span>
                `;
                participantList.appendChild(li);
            });
        } catch (error) {
            console.error('Error loading participants:', error);
            participantList.innerHTML = '<li class="empty-message">Error loading participants</li>';
        }
    }
    
    async function handleAddParticipant(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        
        if (!name.trim()) {
            alert('Name is required');
            return;
        }
        
        try {
            const response = await fetch('/api/participants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add participant');
            }
            
            // Clear the form
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            
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
            // Get participants
            const response = await fetch('/api/participants');
            const participants = await response.json();
            
            if (participants.length < 2) {
                alert('Need at least 2 participants to create an exchange');
                return;
            }
            
            // Show the loading spinner
            spinnerOverlay.classList.remove('hidden');
            
            // Shuffle participants and ensure no one gets themselves
            const assignments = generateRandomAssignments(participants);
            
            // Simulate processing delay (5 seconds)
            await new Promise(resolve => setTimeout(resolve, 5000));
            
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
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            // Hide the spinner in case of error
            spinnerOverlay.classList.add('hidden');
            console.error('Error creating exchange:', error);
            alert('Failed to create exchange');
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
});