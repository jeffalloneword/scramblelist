const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = 5000;

// PostgreSQL connection pool using the DATABASE_URL from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware for parsing JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

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
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        exchange_id INTEGER REFERENCES exchanges(id),
        giver_id INTEGER REFERENCES participants(id),
        receiver_id INTEGER REFERENCES participants(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(exchange_id, giver_id),
        UNIQUE(exchange_id, receiver_id)
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

// HTML for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`Database URL is ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
});