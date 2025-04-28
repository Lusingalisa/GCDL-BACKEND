// const express = require('express');
// const router = express.Router();
// const db = require('../config/db');
// const authenticateToken = require('../middleware/authJWT');

// // Middleware to restrict access to CEO
// const restrictToCEO = async (req, res, next) => {
//   try {
//     const [user] = await db.query('SELECT role FROM users WHERE user_id = ?', [req.user.user_id]);
//     if (user.length === 0 || user[0].role !== 'ceo') {
//       return res.status(403).json({ error: 'Access restricted to CEO' });
//     }
//     next();
//   } catch (error) {
//     console.error('CEO check error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Total Sales by Produce (Bar Chart)
// router.get('/sales-by-produce', authenticateToken, restrictToCEO, async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT p.name AS produceName, SUM(s.amount_paid) AS totalAmount
//       FROM sales s
//       JOIN produce p ON s.produce_id = p.produce_id
//       GROUP BY p.produce_id, p.name
//     `);
//     res.json({ data: rows });
//   } catch (error) {
//     console.error('Sales by produce error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Stock Levels by Produce (Pie Chart)
// router.get('/stock-levels', authenticateToken, restrictToCEO, async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT p.name AS produceName, SUM(s.quantity) AS totalQuantity
//       FROM stock s
//       JOIN produce p ON s.produce_id = p.produce_id
//       GROUP BY p.produce_id, p.name
//     `);
//     res.json({ data: rows });
//   } catch (error) {
//     console.error('Stock levels error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Procurement Volumes by Month (Line Chart)
// router.get('/procurements-by-month', authenticateToken, restrictToCEO, async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT DATE_FORMAT(date, '%Y-%m') AS month, SUM(tonnage) AS totalTonnage
//       FROM procurement
//       GROUP BY DATE_FORMAT(date, '%Y-%m')
//       ORDER BY month
//     `);
//     res.json({ data: rows });
//   } catch (error) {
//     console.error('Procurements by month error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Credit Sales by Status (Doughnut Chart)
// router.get('/credit-sales-by-status', authenticateToken, restrictToCEO, async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT status, SUM(amount_due) AS totalAmount
//       FROM credit_sales
//       GROUP BY status
//     `);
//     res.json({ data: rows });
//   } catch (error) {
//     console.error('Credit sales by status error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// module.exports = router; 

// routes/dashboard.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/authJWT');

// Sales by Produce
router.get('/sales-by-produce', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.name AS produceName,
        SUM(s.amount_paid) AS totalAmount
      FROM sales s
      JOIN produce p ON s.produce_id = p.produce_id
      GROUP BY p.name
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stock Levels
router.get('/stock-levels', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.name AS produceName,
        SUM(s.quantity) AS totalQuantity
      FROM stock s
      JOIN produce p ON s.produce_id = p.produce_id
      GROUP BY p.name
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Procurements by Month
router.get('/procurements-by-month', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') AS month,
        SUM(tonnage) AS totalTonnage
      FROM procurement
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Credit Sales by Status
router.get('/credit-sales-by-status', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        status,
        SUM(amount_due) AS totalAmount
      FROM credit_sales
      GROUP BY status
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;