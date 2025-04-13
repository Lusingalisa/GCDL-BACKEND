const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Allowed produce types
const VALID_PRODUCE_TYPES = ['beans', 'grain maize', 'cowpeas', 'groundnuts', 'rice', 'soybeans'];

// In-memory storage (temporary, replace with MySQL)
let sales = [];

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

// Validation middleware
const validateSalesData = (req, res, next) => {
    console.log('Received body in middleware:', req.body);
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body is missing or invalid' });
    }

    const {
        produceName,
        tonnage,
        amountPaid,
        buyerName,
        salesAgentName,
        date,
        time,
        buyerContact
    } = req.body;

    const requiredFields = [
        'produceName', 'tonnage', 'amountPaid', 'buyerName',
        'salesAgentName', 'date', 'time', 'buyerContact'
    ];

    const missingFields = requiredFields.filter(field => !(field in req.body));
    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Missing required fields',
            missing: missingFields
        });
    }

    if (!produceName || typeof produceName !== 'string') {
        return res.status(400).json({ error: 'Produce name must be a non-empty string' });
    }
    const normalizedProduceName = produceName.toLowerCase().trim();
    if (!VALID_PRODUCE_TYPES.includes(normalizedProduceName)) {
        return res.status(400).json({
            error: 'Invalid produce type',
            validTypes: VALID_PRODUCE_TYPES
        });
    }

    const numericFields = { tonnage, amountPaid };
    for (const [field, value] of Object.entries(numericFields)) {
        if (!isNumeric(value)) {
            return res.status(400).json({ error: `${field} must be a number` });
        }
    }

    if (parseFloat(tonnage) < 0.1) {
        return res.status(400).json({ error: 'Tonnage must be at least 0.1 tons' });
    }
    if (parseFloat(amountPaid) < 0) {
        return res.status(400).json({ error: 'Amount paid must be a non-negative number' });
    }

    if (!buyerName || typeof buyerName !== 'string' || buyerName.trim() === '') {
        return res.status(400).json({ error: 'Buyer name must be a non-empty string' });
    }
    if (!salesAgentName || typeof salesAgentName !== 'string' || salesAgentName.trim() === '') {
        return res.status(400).json({ error: 'Sales agent name must be a non-empty string' });
    }

    if (!isValidPhoneNumber(buyerContact)) {
        return res.status(400).json({ error: 'Invalid buyer contact format (use +256 followed by 9 digits)' });
    }

    if (!isValidDate(date)) {
        return res.status(400).json({ error: 'Invalid date format (use YYYY-MM-DD)' });
    }

    if (!isValidTime(time)) {
        return res.status(400).json({ error: 'Invalid time format (use HH:MM:SS)' });
    }

    req.body.produceName = normalizedProduceName;
    req.body.tonnage = parseFloat(tonnage);
    req.body.amountPaid = parseFloat(amountPaid);
    req.body.buyerName = buyerName.trim();
    req.body.salesAgentName = salesAgentName.trim();
    req.body.buyerContact = buyerContact.trim();

    next();
};

// Helper functions
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

function isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^\+256\d{9}$/;
    return phoneRegex.test(phoneNumber);
}

function isValidDate(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function isValidTime(timeString) {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return timeRegex.test(timeString);
}

function generateUniqueId() {
    return 'SALE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// POST / - Record a sale
router.post('/', authenticate, validateSalesData, (req, res) => {
    console.log('POST / body:', req.body);
    const {
        produceName,
        tonnage,
        amountPaid,
        buyerName,
        salesAgentName,
        date,
        time,
        buyerContact
    } = req.body;

    try {
        const sale = {
            id: generateUniqueId(),
            produceName,
            tonnage,
            amountPaid,
            buyerName,
            salesAgentName,
            date,
            time,
            buyerContact,
            createdAt: new Date().toISOString(),
            receiptNumber: `REC_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            user_id: req.user.user_id // Link sale to authenticated user
        };

        sales.push(sale);
        console.log('Current sales array:', sales);

        const receipt = {
            receiptNumber: sale.receiptNumber,
            date: sale.date,
            time: sale.time,
            produceName: sale.produceName,
            tonnage: sale.tonnage,
            amountPaid: sale.amountPaid,
            buyerName: sale.buyerName,
            salesAgentName: sale.salesAgentName,
            branch: 'TBD'
        };

        res.status(201).json({
            message: 'Sale recorded successfully',
            saleId: sale.id,
            receipt,
            data: sale
        });
    } catch (error) {
        console.error('Sales error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET / - Retrieve all sales
router.get('/', authenticate, (req, res) => {
    console.log('GET / - Current sales:', sales);
    // Optional: Filter sales by user role
    let filteredSales = sales;
    if (req.user.role === 'sales_agent') {
        filteredSales = sales.filter(sale => sale.user_id === req.user.user_id);
    }
    res.json({
        total: filteredSales.length,
        data: filteredSales
    });
});

// GET /:id - Retrieve a specific sale
router.get('/:id', authenticate, (req, res) => {
    const sale = sales.find(s => s.id === req.params.id);
    if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
    }
    // Restrict access for sales agents
    if (req.user.role === 'sales_agent' && sale.user_id !== req.user.user_id) {
        return res.status(403).json({ error: 'Access denied' });
    }
    res.json(sale);
});

module.exports = router;