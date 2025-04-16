// so the manager comes here ans views the sales agents and then has the ability to change them to something else i guess. 
// have to clarify on that. 
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/authJWT');

router.get('/agents', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, username FROM users WHERE role = ?',
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