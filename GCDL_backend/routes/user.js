const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authJWT');
const userController = require('../controllers/userController');
const {checkRole} = require('../middleware/roleCheck');
const bcrypt = require('bcrypt');

// Get all users (accessible by CEO and managers)
router.get('/', 
    authenticateToken,
    checkRole(['ceo','manager']), 
    userController.getAllUsers);

// Update user role (only CEO)
router.patch(
  '/:user_id/role', 
  authenticateToken, 
  checkRole(['ceo']),
  userController.updateUserRole
);

// Delete user (only CEO)
router.delete(
  '/:user_id', 
  authenticateToken, 
  checkRole(['ceo']),
  userController.deleteUser
);

// backend/routes/users.js
router.post(
  '/',
  authenticateToken,
  checkRole(['ceo']),
  async (req, res) => {
    const { username, email, password, role, branch_id } = req.body;
    try {
      // Validate input
      if (!username || !email || !password || !role) {
        return res.status(400).json({ error: 'Username, email, password, and role are required' });
      }
      if (!['ceo', 'manager', 'sales_agent'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      if (role !== 'ceo' && !branch_id) {
        return res.status(400).json({ error: 'branch_id required for non-CEO roles' });
      }

      // Check if email exists
      const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const [result] = await db.query(
        'INSERT INTO users (username, email, password, role, branch_id) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, role, role === 'ceo' ? null : branch_id]
      );

      res.status(201).json({ user_id: result.insertId, message: 'User created successfully' });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

// Add this to your users router
router.get('/sales-agents', authenticateToken, async (req, res) => {
    try {
      // Query to get all users with sales agent role
      const [agents] = await db.query(
        `SELECT user_id, username, role FROM users WHERE role = 'sales_agent'`
      );
      res.json(agents);
    } catch (error) {
      console.error('Error fetching sales agents:', error);
      res.status(500).json({ error: 'Failed to fetch sales agents' });
    }
  });

// Add to backend/routes/users.js, before module.exports
router.get(
  '/:user_id',
  authenticateToken,
  checkRole(['ceo']),
  async (req, res) => {
    const { user_id } = req.params;
    try {
      const [users] = await db.query(
        'SELECT user_id, username, email, role, branch_id, created_at FROM users WHERE user_id = ?',
        [user_id]
      );
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(users[0]);
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ error: 'Failed to retrieve user' });
    }
  }
);

module.exports = router;