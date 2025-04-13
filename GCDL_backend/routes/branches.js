const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validateBranch } = require('../middleware/branchesValidation');

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

// GET / - Retrieve all branches
router.get('/', authenticate, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT branch_id, branch_name, location, created_at FROM branches');
        res.json({
            total: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Get branches error:', error);
        res.status(500).json({ error: 'Failed to retrieve branches' });
    }
});

// GET /:id - Retrieve a specific branch
router.get('/:id', authenticate, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT branch_id, branch_name, location, created_at FROM branches WHERE branch_id = ?',
            [req.params.id]
        );
        const branch = rows[0];
        if (!branch) {
            return res.status(404).json({ error: 'Branch not found' });
        }
        res.json(branch);
    } catch (error) {
        console.error('Get branch error:', error);
        res.status(500).json({ error: 'Failed to retrieve branch' });
    }
});

// POST / - Create a new branch
router.post('/', authenticate, restrictTo('manager', 'ceo'), validateBranch, async (req, res) => {
    const { branch_name, location } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO branches (branch_name, location) VALUES (?, ?)',
            [branch_name, location]
        );
        res.status(201).json({
            message: 'Branch created successfully',
            branch_id: result.insertId,
            data: { branch_id: result.insertId, branch_name, location }
        });
    } catch (error) {
        console.error('Create branch error:', error);
        res.status(500).json({ error: 'Failed to create branch' });
    }
});

// PUT /:id - Update a branch
router.put('/:id', authenticate, restrictTo('manager', 'ceo'), validateBranch, async (req, res) => {
    const { branch_name, location } = req.body;
    try {
        const [rows] = await db.query(
            'SELECT branch_id FROM branches WHERE branch_id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Branch not found' });
        }

        await db.query(
            'UPDATE branches SET branch_name = ?, location = ? WHERE branch_id = ?',
            [branch_name, location, req.params.id]
        );
        res.json({
            message: 'Branch updated successfully',
            data: { branch_id: parseInt(req.params.id), branch_name, location }
        });
    } catch (error) {
        console.error('Update branch error:', error);
        res.status(500).json({ error: 'Failed to update branch' });
    }
});

// DELETE /:id - Delete a branch
router.delete('/:id', authenticate, restrictTo('manager', 'ceo'), async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT branch_id FROM branches WHERE branch_id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Branch not found' });
        }

        // Check for dependencies
        const [dependencies] = await db.query(
            'SELECT COUNT(*) as count FROM users WHERE branch_id = ? ' +
            'UNION ALL SELECT COUNT(*) FROM procurement WHERE branch_id = ? ' +
            'UNION ALL SELECT COUNT(*) FROM stock WHERE branch_id = ?',
            [req.params.id, req.params.id, req.params.id]
        );
        const hasDependencies = dependencies.some(dep => dep.count > 0);
        if (hasDependencies) {
            return res.status(400).json({ error: 'Cannot delete branch with associated records' });
        }

        await db.query('DELETE FROM branches WHERE branch_id = ?', [req.params.id]);
        res.json({ message: 'Branch deleted successfully' });
    } catch (error) {
        console.error('Delete branch error:', error);
        res.status(500).json({ error: 'Failed to delete branch' });
    }
});

module.exports = router;