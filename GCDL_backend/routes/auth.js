        const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Authentication middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Role-based authorization middleware
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
};

// Validation middleware for register
const validateRegister = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Request body is empty' });
    }

    const { username, email, password, role, branch_id } = req.body;
    if (!username || typeof username !== 'string' || username.trim() === '') {
        return res.status(400).json({ error: 'Username is required' });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!role || !['manager', 'sales_agent', 'ceo'].includes(role)) {
        return res.status(400).json({ error: 'Role must be manager, sales_agent, or ceo' });
    }
    if (role !== 'ceo' && (!branch_id || isNaN(parseInt(branch_id)))) {
        return res.status(400).json({ error: 'Valid branch_id is required for non-CEO roles' });
    }

    next();
};

// Validation middleware for login
const validateLogin = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Request body is empty' });
    }

    const { email, password } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
        return res.status(400).json({ error: 'Password is required' });
    }

    next();
};

// Register user
router.post('/register', validateRegister, async (req, res) => {
    const { username, email, password, role, branch_id } = req.body;
    try {
        // Check if email exists
        const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email.trim()]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Check if branch_id exists (if not CEO)
        if (role !== 'ceo') {
            const [branch] = await db.query('SELECT branch_id FROM branches WHERE branch_id = ?', [branch_id]);
            if (branch.length === 0) {
                return res.status(400).json({ error: 'Invalid branch_id' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (username, email, password, role, branch_id) VALUES (?, ?, ?, ?, ?)',
            [username.trim(), email.trim(), hashedPassword, role, role === 'ceo' ? null : branch_id]
        );
        res.status(201).json({ user_id: result.insertId, message: 'User registered successfully' });
    } catch (error) {
        console.error('Register error:', error);
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({ error: 'Database table not found. Please contact administrator.' });
        }
        res.status(500).json({ error: 'Failed to register user' });
    }

  });


// Login user
router.post('/login', validateLogin, async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim()]);
        const user = rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role, branch_id: user.branch_id },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { user_id: user.user_id, username: user.username, role: user.role, branch_id: user.branch_id }
        });
    } catch (error) {
        console.error('Login error:', error);
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({ error: 'Database table not found. Please contact administrator.' });
        }
        res.status(500).json({ error: 'Failed to login' });
    }

  });
  

// Get all users (admin only)
router.get('/users', authenticate, restrictTo('manager', 'ceo'), async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT user_id, username, email, role, branch_id, created_at
            FROM users
        `);
        res.json({
            total: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
});


module.exports = router;