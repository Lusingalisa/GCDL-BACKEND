const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/authJWT');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT produce_id, name FROM produce');
    res.json({
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Fetch produce error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;