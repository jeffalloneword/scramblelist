const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const crypto = require('crypto');
const app = express();
const port = 5000;

// Set a secure password - in production this would be in environment variables
// Using a hardcoded password for simplicity
const CORRECT_PASSWORD_HASH = crypto.createHash('sha256').update('two-pretzels!1').digest('hex');

// PostgreSQL connection pool using the DATABASE_URL from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware for parsing JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for login page only
app.use(express.static(path.join(__dirname, 'public'), {
  index: 'login.html', // Set login.html as the default index
}));

// Authentication middleware
const authenticate = (req, res, next) => {
  // Check if request has a valid auth token
  const authToken = req.get('Authorization');
  
  // If no token present but this is a login request, allow it
  if (req.path === '/auth/login') {
    return next();
  }
  
  // If this is a static resource for the login page or styles, allow it
  if (req.path === '/login.html' || req.path === '/favicon.ico' || req.path === '/' || req.path === '/styles.css') {
    return next();
  }
  
  // For API endpoints and protected resources, require auth
  if (!authToken || authToken !== `Bearer ${CORRECT_PASSWORD_HASH}`) {
    // For API calls, return JSON error
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // For other resources, redirect to login page
    return res.redirect('/');
  }
  
  next();
};

// Apply auth middleware to all routes except the login page
app.use(authenticate);

// API Routes
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      message: 'Server is running', 
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// API to create participants table if it doesn't exist
app.get('/api/setup', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exchanges (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exchange_participants (
        id SERIAL PRIMARY KEY,
        exchange_id INTEGER REFERENCES exchanges(id) ON DELETE CASCADE,
        participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(exchange_id, participant_id)
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        exchange_id INTEGER REFERENCES exchanges(id) ON DELETE CASCADE,
        giver_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(exchange_id, giver_id)
      )
    `);
    
    res.json({ 
      status: 'ok', 
      message: 'Database tables created successfully' 
    });
  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to setup database tables', 
      error: error.message 
    });
  }
});

// API to get all participants
app.get('/api/participants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM participants ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: error.message });
  }
});

// API to add a participant
app.post('/api/participants', async (req, res) => {
  const { name, email } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO participants (name, email) VALUES ($1, $2) RETURNING *',
      [name, email || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ error: error.message });
  }
});

// API to create a new exchange with participants and assignments
app.post('/api/exchanges', async (req, res) => {
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
  
  // Start a transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Create exchange
    const exchangeResult = await client.query(
      'INSERT INTO exchanges (title, description) VALUES ($1, $2) RETURNING id',
      [title, description || null]
    );
    const exchangeId = exchangeResult.rows[0].id;
    
    // 2. Link participants to the exchange
    for (const participant of participants) {
      await client.query(
        'INSERT INTO exchange_participants (exchange_id, participant_id) VALUES ($1, $2)',
        [exchangeId, participant.id]
      );
    }
    
    // 3. Save assignments
    for (const assignment of assignments) {
      await client.query(
        'INSERT INTO assignments (exchange_id, giver_id, receiver_id) VALUES ($1, $2, $3)',
        [exchangeId, assignment.giver.id, assignment.receiver.id]
      );
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      id: exchangeId,
      title,
      description,
      participants: participants.length,
      assignments: assignments.length
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating exchange:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// API to get all exchanges
app.get('/api/exchanges', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM exchanges ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    res.status(500).json({ error: error.message });
  }
});

// API to get a specific exchange with participants and assignments
app.get('/api/exchanges/:id', async (req, res) => {
  const exchangeId = req.params.id;
  
  try {
    // Get exchange details
    const exchangeResult = await pool.query('SELECT * FROM exchanges WHERE id = $1', [exchangeId]);
    
    if (exchangeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Exchange not found' });
    }
    
    const exchange = exchangeResult.rows[0];
    
    // Get participants for this exchange
    const participantsResult = await pool.query(`
      SELECT p.* FROM participants p
      JOIN exchange_participants ep ON p.id = ep.participant_id
      WHERE ep.exchange_id = $1
      ORDER BY p.name
    `, [exchangeId]);
    
    // Get assignments for this exchange
    const assignmentsResult = await pool.query(`
      SELECT a.id, a.exchange_id, 
        giver.id as giver_id, giver.name as giver_name, giver.email as giver_email,
        receiver.id as receiver_id, receiver.name as receiver_name, receiver.email as receiver_email
      FROM assignments a
      JOIN participants giver ON a.giver_id = giver.id
      JOIN participants receiver ON a.receiver_id = receiver.id
      WHERE a.exchange_id = $1
    `, [exchangeId]);
    
    // Format assignments
    const assignments = assignmentsResult.rows.map(row => ({
      id: row.id,
      giver: {
        id: row.giver_id,
        name: row.giver_name,
        email: row.giver_email
      },
      receiver: {
        id: row.receiver_id,
        name: row.receiver_name,
        email: row.receiver_email
      }
    }));
    
    res.json({
      ...exchange,
      participants: participantsResult.rows,
      assignments
    });
  } catch (error) {
    console.error('Error fetching exchange details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login authentication endpoint
app.post('/auth/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  // Hash the provided password and compare with the correct hash
  const providedHash = crypto.createHash('sha256').update(password).digest('hex');
  
  if (providedHash === CORRECT_PASSWORD_HASH) {
    // Return success with the auth token
    return res.json({ 
      success: true, 
      token: CORRECT_PASSWORD_HASH
    });
  } else {
    // Return error for incorrect password
    return res.status(401).json({ 
      error: 'Invalid password' 
    });
  }
});

// Protected main app page
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// HTML for the login page (root)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`Database URL is ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
});