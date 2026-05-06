const express = require('express');
const authRoutes = require('./auth');
const landingRoutes = require('./landing');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/landing', landingRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
