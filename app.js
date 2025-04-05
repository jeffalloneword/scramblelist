const express = require('express');
const path = require('path');
const app = express();
// Use port from environment variable or default to 5000
const port = process.env.PORT || 5000;

// No password needed - using localStorage directly

// In-memory storage for server-side data
// This is only used for the current session and won't persist across restarts
// Client will use localStorage for persistence
const inMemoryParticipants = [];
const inMemoryExchanges = [];

// Simple in-memory data store for server-side operations
// The main storage will be in the client's localStorage
const dataStore = {
  // Get current timestamp
  getNow: () => {
    return new Date().toISOString();
  },
  
  // Get all participants
  getParticipants: () => {
    return inMemoryParticipants;
  },
  
  // Add a participant
  addParticipant: (name, email = null) => {
    const id = inMemoryParticipants.length + 1;
    const created_at = new Date().toISOString();
    const participant = { id, name, email, created_at };
    inMemoryParticipants.push(participant);
    return participant;
  },
  
  // Get all exchanges
  getExchanges: () => {
    return inMemoryExchanges;
  },
  
  // Create a new exchange
  createExchange: (title, description = null, participants = [], assignments = []) => {
    const id = inMemoryExchanges.length + 1;
    const created_at = new Date().toISOString();
    const exchange = { 
      id, 
      title, 
      description, 
      created_at,
      participants, 
      assignments 
    };
    inMemoryExchanges.push(exchange);
    return exchange;
  },
  
  // Get exchange by ID
  getExchangeById: (id) => {
    return inMemoryExchanges.find(e => e.id === parseInt(id)) || null;
  }
};

// Middleware for parsing JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with index.html as the default page - no login required
app.use(express.static(path.join(__dirname, 'public'), {
  index: 'index.html',
}));

// API Routes
app.get('/api/health', (req, res) => {
  const now = dataStore.getNow();
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    storage: 'in-memory',
    timestamp: now
  });
});

// API for initial setup (kept for compatibility with existing clients)
app.get('/api/setup', (req, res) => {
  // No setup needed with localStorage-based approach
  res.json({ 
    status: 'ok', 
    message: 'Application is ready to use with localStorage' 
  });
});

// API to get all participants
app.get('/api/participants', (req, res) => {
  const participants = dataStore.getParticipants();
  res.json(participants);
});

// API to add a participant
app.post('/api/participants', (req, res) => {
  const { name, email } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const participant = dataStore.addParticipant(name, email || null);
  res.status(201).json(participant);
});

// API to create a new exchange with participants and assignments
// Note: This endpoint is kept for compatibility, but exchanges should be
// saved in client-side localStorage for persistence
app.post('/api/exchanges', (req, res) => {
  const { title, description, participants, assignments } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  if (!participants || participants.length < 2) {
    return res.status(400).json({ error: 'At least 2 participants are required' });
  }
  
  if (!assignments || assignments.length === 0) {
    return res.status(400).json({ error: 'Assignments are required' });
  }
  
  // Create exchange
  const exchange = dataStore.createExchange(title, description, participants, assignments);
  
  res.status(201).json({ 
    id: exchange.id,
    title: exchange.title,
    description: exchange.description,
    participants: participants.length,
    assignments: assignments.length
  });
});

// API to get all exchanges
app.get('/api/exchanges', (req, res) => {
  const exchanges = dataStore.getExchanges();
  res.json(exchanges);
});

// API to get a specific exchange with participants and assignments
app.get('/api/exchanges/:id', (req, res) => {
  const exchangeId = parseInt(req.params.id);
  const exchange = dataStore.getExchangeById(exchangeId);
  
  if (!exchange) {
    return res.status(404).json({ error: 'Exchange not found' });
  }
  
  res.json(exchange);
});

// All routes are now handled by the static file middleware

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`Using in-memory storage with localStorage persistence`);
  console.log(`Application is ready to use`);
});