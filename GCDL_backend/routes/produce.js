const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validateProduce } = require('../middleware/produceValidation');

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

// GET / - Retrieve all produce
router.get('/', authenticate, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT produce_id, name, type FROM produce');
        res.json({
            total: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Get produce error:', error);
        res.status(500).json({ error: 'Failed to retrieve produce' });
    }
});

// GET /:id - Retrieve a specific produce
router.get('/:id', authenticate, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT produce_id, name, type FROM produce WHERE produce_id = ?',
            [req.params.id]
        );
        const produce = rows[0];
        if (!produce) {
            return res.status(404).json({ error: 'Produce not found' });
        }
        res.json(produce);
    } catch (error) {
        console.error('Get produce error:', error);
        res.status(500).json({ error: 'Failed to retrieve produce' });
    }
});

// POST / - Create a new produce
router.post('/', authenticate, restrictTo('manager', 'ceo'), validateProduce, async (req, res) => {
    const { name, type } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO produce (name, type) VALUES (?, ?)',
            [name, type]
        );
        res.status(201).json({
            message: 'Produce created successfully',
            produce_id: result.insertId,
            data: { produce_id: result.insertId, name, type }
        });
    } catch (error) {
        console.error('Create produce error:', error);
        res.status(500).json({ error: 'Failed to create produce' });
    }
});

// PUT /:id - Update a produce
router.put('/:id', authenticate, restrictTo('manager', 'ceo'), validateProduce, async (req, res) => {
    const { name, type } = req.body;
    try {
        const [rows] = await db.query(
            'SELECT produce_id FROM produce WHERE produce_id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Produce not found' });
        }

        await db.query(
            'UPDATE produce SET name = ?, type = ? WHERE produce_id = ?',
            [name, type, req.params.id]
        );
        res.json({
            message: 'Produce updated successfully',
            data: { produce_id: parseInt(req.params.id), name, type }
        });
    } catch (error) {
        console.error('Update produce error:', error);
        res.status(500).json({ error: 'Failed to update produce' });
    }
});

// DELETE /:id - Delete a produce
router.delete('/:id', authenticate, restrictTo('manager', 'ceo'), async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT produce_id FROM produce WHERE produce_id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Produce not found' });
        }

        // Check for dependencies (simplified; ideally check all tables)
        const [dependencies] = await db.query(
            'SELECT COUNT(*) as count FROM sales WHERE produce_id = ? ' +
            'UNION ALL SELECT COUNT(*) FROM credit_sales WHERE produce_id = ? ' +
            'UNION ALL SELECT COUNT(*) FROM procurement WHERE produce_id = ? ' +
            'UNION ALL SELECT COUNT(*) FROM stock WHERE produce_id = ?',
            [req.params.id, req.params.id, req.params.id, req.params.id]
        );
        const hasDependencies = dependencies.some(dep => dep.count > 0);
        if (hasDependencies) {
            return res.status(400).json({ error: 'Cannot delete produce with associated records' });
        }

        await db.query('DELETE FROM produce WHERE produce_id = ?', [req.params.id]);
        res.json({ message: 'Produce deleted successfully' });
    } catch (error) {
        console.error('Delete produce error:', error);
        res.status(500).json({ error: 'Failed to delete produce' });
    }

});

module.exports = router;