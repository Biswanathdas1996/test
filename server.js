require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const routes = require('./src/routes');

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Root landing page route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Oktawave Loan Origination System',
    version: '1.0.0',
    endpoints: {
      landing: '/api/landing',
      auth: '/api/auth',
      health: '/api/health'
    },
    callToAction: {
      text: 'Start Your Loan Application',
      link: '/api/landing'
    }
  });
});

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 9001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend allowed: ${process.env.FRONTEND_URL}`);
  });
});
