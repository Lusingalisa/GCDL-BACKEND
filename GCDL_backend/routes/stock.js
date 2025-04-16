const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/authJWT');

router.post('/', authenticateToken, async (req, res) => {
  const { produceId, branchId, quantity } = req.body;

  try {
    // Validate foreign keys
    const [produce] = await db.query('SELECT produce_id FROM produce WHERE produce_id = ?', [produceId]);
    if (!produce.length) {
      return res.status(400).json({ error: 'Invalid produce_id: Produce not found' });
    }
    const [branch] = await db.query('SELECT branch_id FROM branches WHERE branch_id = ?', [branchId]);
    if (!branch.length) {
      return res.status(400).json({ error: 'Invalid branch_id: Branch not found' });
    }

    // Validate quantity
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const [result] = await db.query(
      `INSERT INTO stock (
        produce_id,
        branch_id,
        quantity
      ) VALUES (?, ?, ?)`,
      [parseInt(produceId), parseInt(branchId), parseFloat(quantity)]
    );

    // Emit WebSocket event
    const io = req.app.get('socketio');
    io.emit('data-updated', { type: 'stock' });

    const stock = {
      stockId: result.insertId,
      produceId,
      branchId,
      quantity,
    };

    res.status(201).json({
      message: 'Stock recorded successfully',
      stockId: stock.stockId,
      data: stock,
    });
  } catch (error) {
    console.error('Stock error:', error.message, error.stack);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Foreign key violation: Invalid produce_id or branch_id' });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Duplicate entry detected' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.stock_id,
        s.produce_id,
        p.name AS produceName,
        s.branch_id,
        b.branch_name,
        s.quantity
      FROM stock s
      JOIN produce p ON s.produce_id = p.produce_id
      JOIN branches b ON s.branch_id = b.branch_id
      WHERE s.branch_id = ? OR ? IS NULL
    `, [req.user.branch_id, req.user.branch_id]);
    res.json({
      total: rows.length,
      data: rows.map(row => ({
        stockId: row.stock_id,
        produceId: row.produce_id,
        produceName: row.produceName,
        branchId: row.branch_id,
        branchName: row.branch_name,
        quantity: row.quantity,
      })),
    });
  } catch (error) {
    console.error('Fetch stock error:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        s.stock_id,
        s.produce_id,
        p.name AS produceName,
        s.branch_id,
        b.branch_name,
        s.quantity
      FROM stock s
      JOIN produce p ON s.produce_id = p.produce_id
      JOIN branches b ON s.branch_id = b.branch_id
      WHERE s.stock_id = ? AND (s.branch_id = ? OR ? IS NULL)`,
      [req.params.id, req.user.branch_id, req.user.branch_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Stock record not found' });
    }
    const row = rows[0];
    res.json({
      stockId: row.stock_id,
      produceId: row.produce_id,
      produceName: row.produceName,
      branchId: row.branch_id,
      branchName: row.branch_name,
      quantity: row.quantity,
    });
  } catch (error) {
    console.error('Fetch stock error:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;