const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/authJWT');

router.post('/procurement', authenticateToken, async (req, res) => {
  const {
    produceId,
    type,
    date,
    time,
    tonnage,
    cost,
    dealerName,
    branchId,
    contact,
    sellingPrice,
  } = req.body;

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

    // Basic validation
    if (!tonnage || tonnage <= 0) {
      return res.status(400).json({ error: 'Tonnage must be greater than 0' });
    }
    if (!cost || cost < 0) {
      return res.status(400).json({ error: 'Cost cannot be negative' });
    }
    if (!sellingPrice || sellingPrice < 0) {
      return res.status(400).json({ error: 'Selling price cannot be negative' });
    }
    if (!dealerName || !contact) {
      return res.status(400).json({ error: 'Dealer name and contact are required' });
    }

    const [result] = await db.query(
      `INSERT INTO procurement (
        produce_id,
        type,
        date,
        time,
        tonnage,
        cost,
        dealer_name,
        branch_id,
        contact,
        selling_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(produceId),
        type || null,
        date,
        time,
        parseFloat(tonnage),
        parseInt(cost),
        dealerName.trim(),
        parseInt(branchId),
        contact,
        parseInt(sellingPrice),
      ]
    );

    // Emit WebSocket event
    const io = req.app.get('socketio');
    io.emit('data-updated', { type: 'procurement' });

    const procurement = {
      procurementId: result.insertId,
      produceId,
      type,
      date,
      time,
      tonnage,
      cost,
      dealerName,
      branchId,
      contact,
      sellingPrice,
    };

    res.status(201).json({
      message: 'Procurement recorded successfully',
      procurementId: procurement.procurementId,
      data: procurement,
    });
  } catch (error) {
    console.error('Procurement error:', error.message, error.stack);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Foreign key violation: Invalid produce_id or branch_id' });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Duplicate entry detected' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/procurement', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        pr.procurement_id,
        pr.produce_id,
        p.name AS produceName,
        pr.type,
        pr.date,
        pr.time,
        pr.tonnage,
        pr.cost,
        pr.dealer_name,
        pr.branch_id,
        b.branch_name,
        pr.contact,
        pr.selling_price
      FROM procurement pr
      JOIN produce p ON pr.produce_id = p.produce_id
      JOIN branches b ON pr.branch_id = b.branch_id
      WHERE pr.branch_id = ? OR ? IS NULL
    `, [req.user.branch_id, req.user.branch_id]);
    res.json({
      total: rows.length,
      data: rows.map(row => ({
        procurementId: row.procurement_id,
        produceId: row.produce_id,
        produceName: row.produceName,
        type: row.type,
        date: row.date,
        time: row.time,
        tonnage: row.tonnage,
        cost: row.cost,
        dealerName: row.dealer_name,
        branchId: row.branch_id,
        branchName: row.branch_name,
        contact: row.contact,
        sellingPrice: row.selling_price,
      })),
    });
  } catch (error) {
    console.error('Fetch procurement error:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/procurement/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        pr.procurement_id,
        pr.produce_id,
        p.name AS produceName,
        pr.type,
        pr.date,
        pr.time,
        pr.tonnage,
        pr.cost,
        pr.dealer_name,
        pr.branch_id,
        b.branch_name,
        pr.contact,
        pr.selling_price
      FROM procurement pr
      JOIN produce p ON pr.produce_id = p.produce_id
      JOIN branches b ON pr.branch_id = b.branch_id
      WHERE pr.procurement_id = ? AND (pr.branch_id = ? OR ? IS NULL)`,
      [req.params.id, req.user.branch_id, req.user.branch_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Procurement record not found' });
    }
    const row = rows[0];
    res.json({
      procurementId: row.procurement_id,
      produceId: row.produce_id,
      produceName: row.produceName,
      type: row.type,
      date: row.date,
      time: row.time,
      tonnage: row.tonnage,
      cost: row.cost,
      dealerName: row.dealer_name,
      branchId: row.branch_id,
      branchName: row.branch_name,
      contact: row.contact,
      sellingPrice: row.selling_price,
    });
  } catch (error) {
    console.error('Fetch procurement error:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;