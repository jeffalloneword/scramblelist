const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Simple route for API testing with database
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', database: process.env.DATABASE_URL ? 'connected' : 'not configured' });
});

// For any request that doesn't match a static file, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${PORT}`);
  console.log(`Database URL is ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
});
