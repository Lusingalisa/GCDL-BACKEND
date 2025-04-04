const express = require('express');
const router = express.Router();
const { validateSalesData } = require('../middleware/salesValidation');

// In-memory storage (replace with database in production)
let sales = [];

// Route to record a sale
router.post('/sales', validateSalesData, (req, res) => {
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
            produceName: produceName.trim(),
            tonnage,
            amountPaid,
            buyerName: buyerName.trim(),
            salesAgentName: salesAgentName.trim(),
            date,
            time,
            buyerContact: buyerContact.trim(),
            createdAt: new Date().toISOString(),
            receiptNumber: `REC_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        };

        sales.push(sale);

        // Generate a simple receipt
        const receipt = {
            receiptNumber: sale.receiptNumber,
            date: sale.date,
            time: sale.time,
            produceName: sale.produceName,
            tonnage: sale.tonnage,
            amountPaid: sale.amountPaid,
            buyerName: sale.buyerName,
            salesAgentName: sale.salesAgentName,
            branch: 'TBD' // Replace with actual branch logic if linked to procurement
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

// Route to get all sales
router.get('/sales', (req, res) => {
    res.json({
        total: sales.length,
        data: sales
    });
});

// Route to get a specific sale by ID
router.get('/sales/:id', (req, res) => {
    const sale = sales.find(s => s.id === req.params.id);
    if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
    }
    res.json(sale);
});

// Helper function to generate unique IDs
function generateUniqueId() {
    return 'SALE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

module.exports = router;