document.addEventListener('DOMContentLoaded', () => {
    const exchangeTitleElement = document.getElementById('exchange-title');
    const exchangeDescriptionElement = document.getElementById('exchange-description');
    const assignmentsList = document.getElementById('assignments-list');
    const spinnerOverlay = document.getElementById('spinner-overlay');
    const progressFill = document.querySelector('.progress-fill');
    
    // Show the loading spinner with progress bar
    spinnerOverlay.classList.remove('hidden');
    progressFill.style.width = '0%';
    
    // Simulate a loading process with the progress bar
    const startTime = Date.now();
    const duration = 5000; // 5 seconds
    
    const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration * 100, 100);
        progressFill.style.width = `${progress}%`;
        
        if (progress < 100) {
            requestAnimationFrame(updateProgress);
        } else {
            // When progress is complete, load the exchange data
            spinnerOverlay.classList.add('hidden');
            loadExchangeDetails();
        }
    };
    
    requestAnimationFrame(updateProgress);
    
    // Function to load exchange details
    function loadExchangeDetails() {
        // Get the exchange data from localStorage
        const exchangeData = JSON.parse(localStorage.getItem('currentExchange'));
        
        if (!exchangeData) {
            window.location.href = '/';
            return;
        }
        
        // Set the title and description
        exchangeTitleElement.textContent = exchangeData.title;
        
        if (exchangeData.description) {
            exchangeDescriptionElement.textContent = exchangeData.description;
        } else {
            exchangeDescriptionElement.textContent = 'No description provided.';
        }
        
        // Display the assignments
        assignmentsList.innerHTML = '';
        exchangeData.assignments.forEach(assignment => {
            const li = document.createElement('li');
            li.textContent = `${assignment.giver} → ${assignment.receiver}`;
            assignmentsList.appendChild(li);
        });
    }
    
    // Format date function (utility)
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});
