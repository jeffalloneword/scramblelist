document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const exchangeTitle = document.getElementById('exchange-title');
    const exchangeDescription = document.getElementById('exchange-description');
    const exchangeDate = document.getElementById('exchange-date');
    const assignmentsList = document.getElementById('assignments-list');
    const backButton = document.getElementById('back-to-home');
    const dbStatus = document.getElementById('database-status');
    
    // Helper functions for localStorage data (same as in main script)
    window.storageHelper = {
        // Get all participants from localStorage
        getParticipants: function() {
            const data = localStorage.getItem('scramblelist_participants');
            return data ? JSON.parse(data) : [];
        },
        
        // Get all exchanges from localStorage
        getExchanges: function() {
            const data = localStorage.getItem('scramblelist_exchanges');
            return data ? JSON.parse(data) : [];
        },
        
        // Get exchange by ID
        getExchangeById: function(id) {
            const exchanges = this.getExchanges();
            return exchanges.find(e => e.id === parseInt(id)) || null;
        }
    };
    
    // Format date function (same as in main script)
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
    
    // Get the exchange ID from the URL query parameter
    function getExchangeIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }
    
    // Load exchange details and assignments
    function loadExchangeDetails() {
        const exchangeId = getExchangeIdFromURL();
        
        if (!exchangeId) {
            alert('No exchange ID provided');
            window.location.href = 'index.html';
            return;
        }
        
        // Get exchange details from localStorage
        const exchange = window.storageHelper.getExchangeById(parseInt(exchangeId));
        
        if (!exchange) {
            alert('Exchange not found');
            window.location.href = 'index.html';
            return;
        }
        
        // Update the page with exchange details
        exchangeTitle.textContent = exchange.title;
        exchangeDescription.textContent = exchange.description || 'No description provided';
        exchangeDate.textContent = formatDate(exchange.created_at);
        
        // Display assignments
        assignmentsList.innerHTML = '';
        exchange.assignments.forEach(assignment => {
            const li = document.createElement('li');
            li.textContent = `${assignment.giver.name} → ${assignment.receiver.name}`;
            assignmentsList.appendChild(li);
        });
        
        // Update database status display
        dbStatus.textContent = `Using localStorage | ${formatDate(new Date().toISOString())}`;
        dbStatus.style.color = '#4caf50';
    }
    
    // Navigate back to home page
    backButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // Initialize
    loadExchangeDetails();
});
