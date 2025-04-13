const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authController = require('../controllers/authController');
const {validateEmail} = require('../middleware/validators');

// Middleware to validate email
const validateEmailMiddleware = (req, res, next) => {
  const { email } = req.body;
  const validation = validateEmail(email);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.message });
  }
  next();
};

// Register (optional for MVP, useful for testing)
router.post('/register', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty" });
  }

    const { username, email, password, role, branch_id } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        'INSERT INTO users (username, email, password, role, branch_id) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, role, branch_id]
      );
      res.status(201).json({ user_id: result.insertId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      const user = rows[0];
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign(
        { user_id: user.user_id, role: user.role, branch_id: user.branch_id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
module.exports = router;