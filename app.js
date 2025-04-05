const express = require('express');
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

// Middleware for parsing JSON bodies and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set up express-session for authentication with more permissive settings
app.use(session({
  secret: process.env.SESSION_SECRET || 'scramblelist-session-secret',
  resave: true,
  saveUninitialized: true,
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
  console.log(`Using in-memory storage with localStorage persistence`);
  console.log(`Application is ready to use`);
});