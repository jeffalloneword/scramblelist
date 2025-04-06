document.addEventListener('DOMContentLoaded', () => {
    console.log("Using localStorage for data persistence");
    
    // Initialize localStorage if it doesn't exist
    if (!localStorage.getItem('participants')) {
        localStorage.setItem('participants', JSON.stringify([]));
    }
    console.log("localStorage initialized");
    
    // DOM elements
    const addParticipantForm = document.getElementById('add-participant-form');
    const participantNameInput = document.getElementById('participant-name');
    const participantsList = document.getElementById('participants-list');
    const clearParticipantsBtn = document.getElementById('clear-participants');
    const generateBtn = document.getElementById('generate-btn');
    const exchangeTitleInput = document.getElementById('exchange-title');
    const exchangeDescriptionInput = document.getElementById('exchange-description');
    const spinnerOverlay = document.getElementById('spinner-overlay');
    const progressFill = document.querySelector('.progress-fill');
    
    // Load participants from localStorage
    loadParticipants();
    
    // Event listeners
    addParticipantForm.addEventListener('submit', handleAddParticipant);
    clearParticipantsBtn.addEventListener('click', clearParticipantsList);
    generateBtn.addEventListener('click', handleCreateExchange);
    
    // Function to load participants from localStorage
    function loadParticipants() {
        const participants = JSON.parse(localStorage.getItem('participants')) || [];
        renderParticipantsList(participants);
    }
    
    // Function to render the participants list
    function renderParticipantsList(participants) {
        participantsList.innerHTML = '';
        participants.forEach((participant, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${participant.name}
                <button class="remove-btn" data-index="${index}">Remove</button>
            `;
            participantsList.appendChild(li);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                removeParticipant(index);
            });
        });
    }
    
    // Function to remove a participant
    function removeParticipant(index) {
        const participants = JSON.parse(localStorage.getItem('participants')) || [];
        participants.splice(index, 1);
        localStorage.setItem('participants', JSON.stringify(participants));
        renderParticipantsList(participants);
    }
    
    // Function to handle adding a participant
    async function handleAddParticipant(e) {
        e.preventDefault();
        
        const name = participantNameInput.value.trim();
        
        if (!name) {
            alert('Please enter a participant name');
            return;
        }
        
        const participants = JSON.parse(localStorage.getItem('participants')) || [];
        
        // Check for duplicate names
        if (participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert('This participant is already added');
            return;
        }
        
        participants.push({ name });
        localStorage.setItem('participants', JSON.stringify(participants));
        
        // Update the UI
        renderParticipantsList(participants);
        
        // Clear input fields
        participantNameInput.value = '';
        participantNameInput.focus();
    }
    
    // Function to clear participants list
    function clearParticipantsList() {
        if (confirm('Are you sure you want to clear all participants?')) {
            localStorage.setItem('participants', JSON.stringify([]));
            renderParticipantsList([]);
        }
    }
    
    // Function to handle creating an exchange
    async function handleCreateExchange(e) {
        e.preventDefault();
        
        const title = exchangeTitleInput.value.trim();
        const description = exchangeDescriptionInput.value.trim();
        const participants = JSON.parse(localStorage.getItem('participants')) || [];
        
        if (!title) {
            alert('Please enter an exchange title');
            return;
        }
        
        if (participants.length < 2) {
            alert('Please add at least 2 participants');
            return;
        }
        
        // Show the spinner with progress bar
        spinnerOverlay.classList.remove('hidden');
        
        // Run a timed progress bar animation
        progressFill.style.width = '0%';
        const startTime = Date.now();
        const duration = 5000; // 5 seconds
        
        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration * 100, 100);
            progressFill.style.width = `${progress}%`;
            
            if (progress < 100) {
                requestAnimationFrame(updateProgress);
            } else {
                // When progress is complete, proceed with the exchange
                completeExchangeGeneration(title, description, participants);
            }
        };
        
        requestAnimationFrame(updateProgress);
    }
    
    // Function to complete the exchange generation after the progress bar finishes
    function completeExchangeGeneration(title, description, participants) {
        // Generate the random assignments
        const assignments = generateRandomAssignments(participants);
        
        // Save the exchange data to localStorage
        const exchangeData = {
            title,
            description,
            date: new Date().toISOString(),
            participants,
            assignments
        };
        
        // Save to localStorage
        localStorage.setItem('currentExchange', JSON.stringify(exchangeData));
        
        // Redirect to the results page
        window.location.href = `/results.html`;
    }
    
    // Function to generate random assignments
    function generateRandomAssignments(participants) {
        // Create a copy of the participants array to shuffle
        const givers = [...participants];
        const receivers = [...participants];
        
        // Shuffle the receivers array
        for (let i = receivers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
        }
        
        // Make sure no one is assigned to themselves
        let valid = true;
        for (let i = 0; i < givers.length; i++) {
            if (givers[i].name === receivers[i].name) {
                valid = false;
                break;
            }
        }
        
        // If not valid, try again recursively
        if (!valid && participants.length > 1) {
            return generateRandomAssignments(participants);
        }
        
        // Create the assignments
        return givers.map((giver, index) => ({
            giver: giver.name,
            receiver: receivers[index].name
        }));
    }
});
