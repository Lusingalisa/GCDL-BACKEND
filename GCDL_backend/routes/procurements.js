const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gcdl',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware for validation
const validateProcurementData = async (req, res, next) => {
  const { name, type, date, time, tonnage, cost, dealerName, branch, contact, sellingPrice } = req.body;
  if (!name || !type || !date || !time || !tonnage || !cost || !dealerName || !branch || !contact || !sellingPrice) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (tonnage < 1) {
    return res.status(400).json({ error: 'Tonnage must be at least 1 ton' });
  }
  if (!/^\+256\d{9}$/.test(contact)) {
    return res.status(400).json({ error: 'Phone number must be in +256 format followed by 9 digits' });
  }
  if (!['maganjo', 'matugga'].includes(branch)) {
    return res.status(400).json({ error: 'Invalid branch' });
  }
  next();
};

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// POST procurement
router.post('/procurements', authMiddleware, validateProcurementData, async (req, res) => {
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
    sellingPrice,
  } = req.body;

  try {
    const id = generateUniqueId();
    const profitMargin = calculateProfitMargin(cost, sellingPrice);
    const [result] = await pool.execute(
      `INSERT INTO procurements (
        id, name, type, date, time, tonnage, cost, dealer_name, branch, contact, selling_price, profit_margin
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        type.trim(),
        date,
        time,
        tonnage,
        cost,
        dealerName.trim(),
        branch,
        contact.trim(),
        sellingPrice,
        profitMargin,
      ]
    );

    const procurement = {
      id,
      name,
      type,
      date,
      time,
      tonnage,
      cost,
      dealerName,
      branch,
      contact,
      sellingPrice,
      profitMargin,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      message: 'Procurement recorded successfully',
      procurementId: id,
      data: procurement,
    });
  } catch (error) {
    console.error('Procurement error:', error);
    res.status(500).json({ error: 'Failed to save procurement' });
  }
});

// GET all procurements (with pagination)
router.get('/procurements', authMiddleware, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await pool.execute(
      `SELECT * FROM procurements ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM procurements`);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: rows,
    });
  } catch (error) {
    console.error('Fetch procurements error:', error);
    res.status(500).json({ error: 'Failed to fetch procurements' });
  }
});

// GET single procurement
router.get('/procurements/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT * FROM procurements WHERE id = ?`, [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Procurement not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Fetch procurement error:', error);
    res.status(500).json({ error: 'Failed to fetch procurement' });
  }
});

// Helper functions
function generateUniqueId() {
  return 'PROC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function calculateProfitMargin(cost, sellingPrice) {
  if (cost === 0) return 0;
  return Number(((sellingPrice - cost) / cost * 100).toFixed(2));
}

module.exports = router;