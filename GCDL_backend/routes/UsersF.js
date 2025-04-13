const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/authJWT');

router.get('/agents', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, name FROM users WHERE role = ?',
      ['sales_agent']
    );
    res.json({
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Fetch agents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;