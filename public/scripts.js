document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
    const authToken = sessionStorage.getItem('authToken');
    
    // If not on the login page and not authenticated, redirect to login
    if (!window.location.pathname.includes('login.html') && 
        !isAuthenticated && 
        !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/';
        return;
    }
    
    // Add auth token to all fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        // Don't add auth header for login requests
        if (url.includes('/auth/login')) {
            return originalFetch(url, options);
        }
        
        // Add the Authorization header to the options
        const authOptions = {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${authToken}`
            }
        };
        
        return originalFetch(url, authOptions);
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
    const pastExchangesContainer = document.getElementById('past-exchanges-container');
    
    // Make sure spinner is hidden on page load
    if (spinnerOverlay) {
        spinnerOverlay.classList.add('hidden');
    }
    
    // Only proceed with app initialization if we have all the necessary elements
    if (addParticipantForm && participantList) {
        // Check database connection
        checkDatabaseConnection();
        
        // Initialize the participants table and then load participants
        setupDatabase().then(() => {
            // Load participants after database setup is complete
            loadParticipants();
            // Load past exchanges
            loadPastExchanges();
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
            
            // Simulate processing delay for animation (10 seconds)
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Save the exchange to the database
            const saveResponse = await fetch('/api/exchanges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    description,
                    participants,
                    assignments
                })
            });
            
            if (!saveResponse.ok) {
                throw new Error('Failed to save exchange');
            }
            
            const savedExchange = await saveResponse.json();
            
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
            
            // Update the past exchanges list
            loadPastExchanges();
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
    
    async function loadPastExchanges() {
        try {
            const response = await fetch('/api/exchanges');
            const exchanges = await response.json();
            
            if (exchanges.length === 0) {
                pastExchangesContainer.innerHTML = '<p class="empty-message">No exchanges created yet.</p>';
                return;
            }
            
            // Create a list for exchanges
            const exchangesList = document.createElement('ul');
            exchangesList.id = 'past-exchanges-list';
            pastExchangesContainer.innerHTML = '';
            pastExchangesContainer.appendChild(exchangesList);
            
            // Load and display each exchange as a list item
            for (const exchange of exchanges) {
                const detailsResponse = await fetch(`/api/exchanges/${exchange.id}`);
                if (!detailsResponse.ok) continue;
                
                const details = await detailsResponse.json();
                
                // Create list item for this exchange
                const exchangeItem = document.createElement('li');
                exchangeItem.classList.add('past-exchange-item');
                exchangeItem.dataset.exchangeId = details.id;
                
                // Create the exchange header (always visible)
                const title = document.createElement('div');
                title.classList.add('past-exchange-title');
                title.textContent = details.title;
                
                const date = document.createElement('div');
                date.classList.add('past-exchange-date');
                date.textContent = formatDate(details.created_at);
                
                // Create the details section (hidden by default)
                const detailsSection = document.createElement('div');
                detailsSection.classList.add('exchange-details');
                
                // Add description if available
                if (details.description) {
                    const descDiv = document.createElement('div');
                    descDiv.classList.add('past-exchange-description');
                    descDiv.textContent = details.description;
                    detailsSection.appendChild(descDiv);
                }
                
                // Create participants count
                const participantsCount = document.createElement('div');
                participantsCount.classList.add('exchange-participants-count');
                participantsCount.textContent = `Participants: ${details.participants.length}`;
                detailsSection.appendChild(participantsCount);
                
                // Create assignments list
                const assignmentsList = document.createElement('ul');
                assignmentsList.classList.add('exchange-assignments');
                
                details.assignments.forEach(assignment => {
                    const li = document.createElement('li');
                    li.textContent = `${assignment.giver.name} → ${assignment.receiver.name}`;
                    assignmentsList.appendChild(li);
                });
                detailsSection.appendChild(assignmentsList);
                
                // Assemble the exchange item
                exchangeItem.appendChild(title);
                exchangeItem.appendChild(date);
                exchangeItem.appendChild(detailsSection);
                
                // Add click event to toggle details
                exchangeItem.addEventListener('click', function() {
                    // Close any currently open exchange
                    document.querySelectorAll('.past-exchange-item.active').forEach(item => {
                        if (item !== this) {
                            item.classList.remove('active');
                        }
                    });
                    
                    // Toggle this exchange
                    this.classList.toggle('active');
                    
                    // Scroll this exchange into view if it's active
                    if (this.classList.contains('active')) {
                        this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                });
                
                exchangesList.appendChild(exchangeItem);
            }
        } catch (error) {
            console.error('Error loading past exchanges:', error);
            pastExchangesContainer.innerHTML = '<p class="empty-message">Error loading exchanges.</p>';
        }
    }
});