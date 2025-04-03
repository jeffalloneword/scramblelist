const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
// Use port from environment variable or default to 5000
const port = process.env.PORT || 5000;

// Set a secure password - in production this would be in environment variables
// Using a hardcoded password for simplicity
const CORRECT_PASSWORD = 'two-pretzels!1';
const CORRECT_PASSWORD_HASH = crypto.createHash('sha256').update(CORRECT_PASSWORD).digest('hex');

// PostgreSQL connection pool using the DATABASE_URL from environment variables
// If DATABASE_URL is not set, construct it from individual PostgreSQL variables
let connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.PGHOST && process.env.PGUSER && 
    process.env.PGPASSWORD && process.env.PGDATABASE && process.env.PGPORT) {
  connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
  console.log('DATABASE_URL constructed from individual PostgreSQL environment variables');
}

// Create a mock database pool in case no real database is available
// This will allow the application to run in demo mode
let pool;
if (connectionString) {
  try {
    pool = new Pool({
      connectionString: connectionString,
    });
    console.log('PostgreSQL pool created');
  } catch (error) {
    console.error('Failed to create PostgreSQL pool:', error.message);
    createMockPool();
  }
} else {
  console.log('No database connection string available, creating mock pool');
  createMockPool();
}

// Function to create a mock database pool
function createMockPool() {
  console.log('WARNING: Running with in-memory mock database. Data will not persist.');
  
  // Create an in-memory mock of participants
  const inMemoryParticipants = [];
  const inMemoryExchanges = [];
  const inMemoryAssignments = [];
  const inMemoryExchangeParticipants = [];
  
  // Create a mock pool object with basic functionality
  pool = {
    query: async (text, params) => {
      // Handle different types of queries
      if (text.includes('SELECT NOW()')) {
        return { rows: [{ now: new Date().toISOString() }] };
      }
      
      // Create tables - just return success
      if (text.includes('CREATE TABLE')) {
        return { rows: [] };
      }
      
      // Insert into participants
      if (text.includes('INSERT INTO participants')) {
        const id = inMemoryParticipants.length + 1;
        const name = params[0];
        const email = params[1];
        const created_at = new Date().toISOString();
        const participant = { id, name, email, created_at };
        inMemoryParticipants.push(participant);
        return { rows: [participant] };
      }
      
      // Select all participants
      if (text === 'SELECT * FROM participants ORDER BY name') {
        return { rows: inMemoryParticipants };
      }
      
      // Default for unhandled queries
      console.warn('Mock database: Unhandled query', text);
      return { rows: [] };
    },
    connect: async () => {
      return {
        query: async () => ({ rows: [] }),
        release: () => {}
      };
    }
  };
}

// Middleware for parsing JSON bodies and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set up express-session for authentication with more permissive settings
app.use(session({
  secret: 'scramblelist-session-secret', // Secret used to sign the session ID cookie
  resave: true, // Force session to be saved
  saveUninitialized: true, // Save uninitialized sessions
  cookie: {
    httpOnly: true, // Prevent client-side JS from reading the cookie
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/', // Ensure cookie is available for all paths
    secure: false, // Don't require HTTPS
    sameSite: 'none' // Remove cross-site restrictions
  }
}));

// Serve static files with login-simple as the default page
app.use(express.static(path.join(__dirname, 'public'), {
  index: 'login-simple.html',
}));

// Authentication middleware using a much simpler approach
// that works even in environments that block cookies/sessions
const authenticate = (req, res, next) => {
  console.log("Auth check - Path:", req.path);
  
  // Check if this is public resource that doesn't need authentication
  if (
    req.path === '/auth/login' || 
    req.path === '/auth/login-simple' ||
    req.path === '/login-simple.html' || 
    req.path === '/login.html' || 
    req.path === '/favicon.ico' || 
    req.path === '/' || 
    req.path === '/styles.css'
  ) {
    console.log("Public path, no auth needed");
    return next();
  }
  
  // Get token from URL query parameter
  const urlToken = req.query.token;
  
  // Check session auth
  const isAuthenticatedBySession = req.session && req.session.authenticated === true;
  
  // Check cookie auth
  const isAuthenticatedByCookie = req.cookies && req.cookies.authenticated === 'true';
  
  // Check token auth
  let isAuthenticatedByToken = false;
  if (urlToken && authTokens.has(urlToken)) {
    const tokenData = authTokens.get(urlToken);
    if (tokenData && tokenData.expires > Date.now()) {
      isAuthenticatedByToken = true;
    }
  }
  
  // For API endpoints, also check for the global token that might be stored in a closure
  let isAuthenticatedByGlobalToken = false;
  if (req.path.startsWith('/api/') && global.authToken && authTokens.has(global.authToken)) {
    const tokenData = authTokens.get(global.authToken);
    if (tokenData && tokenData.expires > Date.now()) {
      isAuthenticatedByGlobalToken = true;
    }
  }
  
  // Combine all authentication methods
  const isAuthenticated = isAuthenticatedBySession || isAuthenticatedByCookie || 
                          isAuthenticatedByToken || isAuthenticatedByGlobalToken;
  
  console.log(`Auth methods - Session: ${isAuthenticatedBySession}, Cookie: ${isAuthenticatedByCookie}, ` +
              `Token: ${isAuthenticatedByToken}, Global: ${isAuthenticatedByGlobalToken}`);
  
  if (!isAuthenticated) {
    // For API calls, return JSON error
    if (req.path.startsWith('/api/')) {
      console.log("Unauthorized API access attempt");
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // For other resources, redirect to login page
    console.log("Not authenticated, redirecting to login page");
    return res.redirect('/');
  }
  
  // If authenticated by token but not by session, update session if possible
  if (!isAuthenticatedBySession && req.session) {
    req.session.authenticated = true;
    
    // Also set cookie as a backup
    res.cookie('authenticated', 'true', { 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
      path: '/'
    });
    
    console.log("Updated session and cookie from token authentication");
  }
  
  // For successful token-based authentication, store the token globally for API calls
  if (isAuthenticatedByToken && urlToken) {
    global.authToken = urlToken;
  }
  
  console.log("User is authenticated, proceeding");
  next();
};

// Apply auth middleware to all routes
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

// Generate a unique authentication token
const generateAuthToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Store for auth tokens with expiration
const authTokens = new Map();

// Simple form-based login handler - used by the simple login form
app.post('/auth/login-simple', (req, res) => {
  const { password } = req.body;
  
  console.log('Login attempt with password');
  
  if (password === CORRECT_PASSWORD) {
    // Set authentication in session
    req.session.authenticated = true;
    
    // Also set a cookie as a backup authentication method
    res.cookie('authenticated', 'true', { 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax', // Help with cross-site issues
      path: '/' // Ensure cookie is available for all paths
    });
    
    // Generate a token for URL-based authentication (fallback)
    const authToken = generateAuthToken();
    authTokens.set(authToken, {
      created: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
    
    console.log('Setting authentication in session and cookie, redirecting to /app with token');
    
    // Redirect to the application page with token in URL
    return res.redirect(`/app?token=${authToken}`);
  } else {
    console.log('Invalid password attempt');
    
    // Show an error message
    return res.status(401).send(`
      <html>
        <head>
          <title>Invalid Password</title>
          <meta http-equiv="refresh" content="3;url=/" />
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; }
            .error { color: #d33; }
          </style>
        </head>
        <body>
          <h1 class="error">Invalid Password</h1>
          <p>The password you entered is incorrect. Redirecting back to login page...</p>
        </body>
      </html>
    `);
  }
});

// JSON API login endpoint - used by the original login page
app.post('/auth/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  // Hash the provided password and compare with the correct hash
  const providedHash = crypto.createHash('sha256').update(password).digest('hex');
  
  if (providedHash === CORRECT_PASSWORD_HASH || password === CORRECT_PASSWORD) {
    // Set authentication in session
    req.session.authenticated = true;
    
    // Also set a cookie as a backup authentication method
    res.cookie('authenticated', 'true', { 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax', // Help with cross-site issues
      path: '/' // Ensure cookie is available for all paths
    });
    
    // Generate a token for URL-based authentication (fallback)
    const authToken = generateAuthToken();
    authTokens.set(authToken, {
      created: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
    
    // Store the token globally for API usage
    global.authToken = authToken;
    
    console.log('API login successful - session, cookie and token authentication set');
    
    // Return success with the token
    return res.json({ 
      success: true,
      token: authToken,
      redirectTo: `/app?token=${authToken}`
    });
  } else {
    console.log('API login failed - invalid password');
    
    // Return error for incorrect password
    return res.status(401).json({ 
      error: 'Invalid password' 
    });
  }
});

// Route to log out the user
app.get('/logout', (req, res) => {
  // Clear cookie with the same settings it was set with to ensure proper removal
  res.clearCookie('authenticated', { 
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });
  
  // Clear the session
  if (req.session) {
    req.session.authenticated = false;
    req.session.destroy(err => {
      if (err) console.error('Error destroying session:', err);
    });
  }
  
  console.log('Logging out user, cleared authentication cookie and session');
  res.redirect('/');
});

// Protected main app page
app.get('/app', (req, res) => {
  // Check all authentication methods
  const isAuthenticatedByCookie = req.cookies && req.cookies.authenticated === 'true';
  const isAuthenticatedBySession = req.session && req.session.authenticated === true;
  
  // Check URL token authentication
  let isAuthenticatedByToken = false;
  const authToken = req.query.token;
  if (authToken && authTokens.has(authToken)) {
    const tokenData = authTokens.get(authToken);
    if (tokenData && tokenData.expires > Date.now()) {
      isAuthenticatedByToken = true;
      console.log("App route - Valid token in URL:", authToken);
    } else if (tokenData) {
      // Expired token, remove it
      authTokens.delete(authToken);
      console.log("App route - Token expired, removed");
    }
  }
  
  const isAuthenticated = isAuthenticatedByCookie || isAuthenticatedBySession || isAuthenticatedByToken;
  
  console.log('App route - Cookie auth:', isAuthenticatedByCookie);
  console.log('App route - Session auth:', isAuthenticatedBySession);
  console.log('App route - Token auth:', isAuthenticatedByToken);
  
  if (isAuthenticated) {
    // If authenticated by token or cookie but not session, store in session for future
    if ((isAuthenticatedByToken || isAuthenticatedByCookie) && !isAuthenticatedBySession && req.session) {
      req.session.authenticated = true;
      console.log('Updated session authentication from token/cookie');
    }
    
    // Instead of trying complex iframe approaches, just send the file and handle 
    // tokens in the scripts.js file which already exists
    console.log('Sending index.html file directly');
    
    // Store authToken in globalAuthToken to be accessible without URL params
    if (authToken) {
      global.authToken = authToken;
      console.log('Global auth token set for API use');
    }
    
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    console.log('Not authenticated, redirecting to login');
    res.redirect('/');
  }
});

// HTML for the login page (root)
app.get('/', (req, res) => {
  // Check all authentication methods
  const isAuthenticatedByCookie = req.cookies && req.cookies.authenticated === 'true';
  const isAuthenticatedBySession = req.session && req.session.authenticated === true;
  
  // Check URL token authentication
  let isAuthenticatedByToken = false;
  const authToken = req.query.token;
  if (authToken && authTokens.has(authToken)) {
    const tokenData = authTokens.get(authToken);
    if (tokenData && tokenData.expires > Date.now()) {
      isAuthenticatedByToken = true;
      console.log("Root route - Valid token in URL");
    }
  }
  
  const isAuthenticated = isAuthenticatedByCookie || isAuthenticatedBySession || isAuthenticatedByToken;
  
  if (isAuthenticated) {
    console.log('Root route - Already authenticated, redirecting to app');
    
    // If authenticated by token, preserve the token in the redirect
    if (isAuthenticatedByToken && authToken) {
      return res.redirect(`/app?token=${authToken}`);
    }
    
    return res.redirect('/app');
  }
  
  console.log('Root route - Not authenticated, showing login page');
  res.sendFile(path.join(__dirname, 'public', 'login-simple.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  
  if (connectionString) {
    console.log(`Database connection is configured`);
    // Test the database connection immediately
    pool.query('SELECT NOW()')
      .then(() => console.log('Successfully connected to PostgreSQL database'))
      .catch(err => console.error('Database connection error:', err.message));
  } else {
    console.log(`WARNING: Database connection is not configured. The application might not function correctly.`);
    console.log(`Please set DATABASE_URL or all PostgreSQL environment variables (PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT).`);
  }
});