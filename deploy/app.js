const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle the results page
app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'results.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Listerical! app listening at http://0.0.0.0:${port}`);
  console.log(`Access it at http://localhost:${port}`);
});