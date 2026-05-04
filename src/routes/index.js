const express = require('express');
const authRoutes = require('./auth');
const loanRoutes = require('./loan');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/loan', loanRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
