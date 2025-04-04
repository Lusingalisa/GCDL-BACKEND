const express = require('express');
const router = express.Router();
const { validateProcurementData } = require('../middleware/procurementValidation'); // Fixed typo

// In-memory storage (replace with database in production)
let procurements = [];

// Route to record procurement details
router.post('/procurements', validateProcurementData, (req, res) => {
    const {
        name,
        type,
        date,
        time,
        tonnage,
        cost,
        dealerName,
        branch,
        contact,
        sellingPrice
    } = req.body;

    try {
        const procurement = {
            id: generateUniqueId(),
            name: name.trim(),
            type,
            date,
            time,
            tonnage,
            cost,
            dealerName: dealerName.trim(),
            branch,
            contact: contact.trim(),
            sellingPrice,
            createdAt: new Date().toISOString(),
            profitMargin: calculateProfitMargin(cost, sellingPrice)
        };

        procurements.push(procurement);

        res.status(201).json({
            message: 'Procurement recorded successfully',
            procurementId: procurement.id,
            data: procurement
        });
    } catch (error) {
        console.error('Procurement error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper functions
function generateUniqueId() {
    return 'PROC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function calculateProfitMargin(cost, sellingPrice) {
    return Number(((sellingPrice - cost) / cost * 100).toFixed(2));
}

// Additional routes
router.get('/procurements', (req, res) => {
    res.json({
        total: procurements.length,
        data: procurements
    });
});

router.get('/procurements/:id', (req, res) => {
    const procurement = procurements.find(p => p.id === req.params.id);
    if (!procurement) {
        return res.status(404).json({ error: 'Procurement not found' });
    }
    res.json(procurement);
});

module.exports = router;