const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validateCreditSale } = require('../middleware/credit-salesValidation');

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

// POST / - Record a credit sale
router.post('/', authenticate, restrictTo('sales_agent'), validateCreditSale, async (req, res) => {
    console.log('POST /credit-sales body:', req.body);
    const {
        produceName,
        tonnage,
        amountDue,
        buyerName,
        nationalId,
        location,
        dueDate
    } = req.body;

    try {
        // Find produce_id
        const [produceRows] = await db.query('SELECT produce_id FROM produce WHERE name = ?', [produceName]);
        if (produceRows.length === 0) {
            return res.status(400).json({ error: 'Invalid produce name' });
        }
        const produce_id = produceRows[0].produce_id;

        const [result] = await db.query(
            `INSERT INTO credit_sales (
                buyer_name, national_id, location, amount_due, due_date,
                produce_id, tonnage, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                buyerName,
                nationalId,
                location,
                amountDue,
                dueDate,
                produce_id,
                tonnage
            ]
        );

        const creditSale = {
            credit_sale_id: result.insertId,
            buyer_name: buyerName,
            national_id: nationalId,
            location,
            amount_due: amountDue,
            due_date: dueDate,
            produce_id,
            produce_name: produceName,
            tonnage,
            status: 'pending',
            sales_agent_id: req.user.user_id
        };

        res.status(201).json({
            message: 'Credit sale recorded successfully',
            creditSaleId: creditSale.credit_sale_id,
            data: creditSale
        });
    } catch (error) {
        console.error('Credit sale error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET / - Retrieve all credit sales
router.get('/', authenticate, async (req, res) => {
    try {
        let query = `
            SELECT cs.credit_sale_id, cs.buyer_name, cs.national_id, cs.location,
                   cs.amount_due, cs.due_date, cs.produce_id, p.name AS produce_name,
                   cs.tonnage, cs.status
            FROM credit_sales cs
            JOIN produce p ON cs.produce_id = p.produce_id
        `;
        let params = [];

        if (req.user.role === 'sales_agent') {
            query += `
                JOIN sales s ON cs.produce_id = s.produce_id
                WHERE s.sales_agent_id = ?
            `;
            params.push(req.user.user_id);
        }

        const [rows] = await db.query(query, params);
        res.json({
            total: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Get credit sales error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /:id - Retrieve a specific credit sale
router.get('/:id', authenticate, async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT cs.credit_sale_id, cs.buyer_name, cs.national_id, cs.location,
                   cs.amount_due, cs.due_date, cs.produce_id, p.name AS produce_name,
                   cs.tonnage, cs.status
            FROM credit_sales cs
            JOIN produce p ON cs.produce_id = p.produce_id
            WHERE cs.credit_sale_id = ?
            `,
            [req.params.id]
        );

        const creditSale = rows[0];
        if (!creditSale) {
            return res.status(404).json({ error: 'Credit sale not found' });
        }

        // Restrict sales agents to their own sales (approximate via produce_id)
        if (req.user.role === 'sales_agent') {
            const [saleRows] = await db.query(
                'SELECT sale_id FROM sales WHERE produce_id = ? AND sales_agent_id = ?',
                [creditSale.produce_id, req.user.user_id]
            );
            if (saleRows.length === 0) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        res.json(creditSale);
    } catch (error) {
        console.error('Get credit sale error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;