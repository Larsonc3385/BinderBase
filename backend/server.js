const path = require('path');
const express = require('express');
const app = express();

// Serve static files from frontend/dist
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

// API routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// Catch-all route for frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

module.exports = app;