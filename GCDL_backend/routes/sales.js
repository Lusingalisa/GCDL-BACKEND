const express = require('express');
const router = express.Router();
const { validateSalesData } = require('../middleware/salesValidation');
const db = require('../config/db');
const authenticateToken = require('../middleware/authJWT');

router.post('/', authenticateToken, validateSalesData, async (req, res) => {
  const {
    produceId,
    tonnage,
    amountPaid,
    buyerName,
    salesAgentId,
    date,
    time,
    buyerContact,
    receiptUrl,
  } = req.body;

  try {
    const [produce] = await db.query('SELECT produce_id FROM produce WHERE produce_id = ?', [produceId]);
    if (!produce.length) {
      return res.status(400).json({ error: 'Invalid produce_id: Produce not found' });
    }
    const [agent] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [salesAgentId]);
    if (!agent.length) {
      return res.status(400).json({ error: 'Invalid sales_agent_id: Agent not found' });
    }

    const [result] = await db.query(
      `INSERT INTO sales (
        produce_id,
        tonnage,
        amount_paid,
        buyer_name,
        sales_agent_id,
        date,
        time,
        buyer_contact,
        receipt_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(produceId),
        parseFloat(tonnage),
        parseFloat(amountPaid),
        buyerName.trim(),
        parseInt(salesAgentId),
        date,
        time,
        buyerContact.trim(),
        receiptUrl || null,
      ]
    );

    // Emit WebSocket event
    const io = req.app.get('socketio');
    io.emit('data-updated', { type: 'sales' });

    const sale = {
      saleId: result.insertId,
      produceId,
      tonnage,
      amountPaid,
      buyerName,
      salesAgentId,
      date,
      time,
      buyerContact,
      receiptUrl,
    };

    const receipt = {
      receiptNumber: `REC_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date,
      time,
      produceId,
      tonnage,
      amountPaid,
      buyerName,
      salesAgentId,
      branch: req.user.branch_id || 'TBD',
    };

    res.status(201).json({
      message: 'Sale recorded successfully',
      saleId: sale.saleId,
      receipt,
      data: sale,
    });
  } catch (error) {
    console.error('Sales error:', error.message, error.stack);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Foreign key violation: Invalid produce_id or sales_agent_id' });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Duplicate entry detected' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Existing GET endpoints remain unchanged
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.sale_id,
        s.produce_id,
        p.name AS produceName,
        s.tonnage,
        s.amount_paid,
        s.buyer_name,
        s.sales_agent_id,
        u.username AS salesAgentName,
        s.date,
        s.time,
        s.buyer_contact,
        s.receipt_url
      FROM sales s
      JOIN produce p ON s.produce_id = p.produce_id
      JOIN users u ON s.sales_agent_id = u.user_id
      WHERE s.sales_agent_id = ?
    `, [req.user.user_id]);
    res.json({
      total: rows.length,
      data: rows.map(row => ({
        saleId: row.sale_id,
        produceId: row.produce_id,
        produceName: row.produceName,
        tonnage: row.tonnage,
        amountPaid: row.amount_paid,
        buyerName: row.buyer_name,
        salesAgentId: row.sales_agent_id,
        salesAgentName: row.salesAgentName,
        date: row.date,
        time: row.time,
        buyerContact: row.buyer_contact,
        receiptUrl: row.receipt_url,
      })),
    });
  } catch (error) {
    console.error('Fetch sales error:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/sales/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        s.sale_id,
        s.produce_id,
        p.name AS produceName,
        s.tonnage,
        s.amount_paid,
        s.buyer_name,
        s.sales_agent_id,
        u.username AS salesAgentName,
        s.date,
        s.time,
        s.buyer_contact,
        s.receipt_url
      FROM sales s
      JOIN produce p ON s.produce_id = p.produce_id
      JOIN users u ON s.sales_agent_id = u.user_id
      WHERE s.sale_id = ? AND s.sales_agent_id = ?`,
      [req.params.id, req.user.user_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    const row = rows[0];
    res.json({
      saleId: row.sale_id,
      produceId: row.produce_id,
      produceName: row.produceName,
      tonnage: row.tonnage,
      amountPaid: row.amount_paid,
      buyerName: row.buyer_name,
      salesAgentId: row.sales_agent_id,
      salesAgentName: row.salesAgentName,
      date: row.date,
      time: row.time,
      buyerContact: row.buyer_contact,
      receiptUrl: row.receipt_url,
    });
  } catch (error) {
    console.error('Fetch sale error:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;