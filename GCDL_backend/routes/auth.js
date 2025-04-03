const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register (optional for MVP, useful for testing)
router.post('/register', async (req, res) => {
    const { username, email, password, role, branch_id } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password, role, branch_id) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, role, branch_id]
      );
      res.status(201).json({ user_id: result.insertId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });