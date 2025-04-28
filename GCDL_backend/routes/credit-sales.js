

// const express = require('express');
// const router = express.Router();
// const db = require('../config/db');
// const authenticateToken = require('../middleware/authJWT');

// router.post('/', authenticateToken, async (req, res) => {
//   try {
//     console.log('POST /credit_sales: req.body =', req.body);
//     console.log('POST /credit_sales: req.user =', req.user);
//     const {
//       buyerName,
//       nationalId,
//       location,
//       amountDue,
//       dueDate,
//       produceId,
//       tonnage,
//       status,
//       salesAgentId,
//     } = req.body;

//     // Validate foreign keys
//     const [produce] = await db.query('SELECT produce_id FROM produce WHERE produce_id = ?', [produceId]);
//     console.log('POST /credit_sales: produce =', produce);
//     if (!produce.length) {
//       return res.status(400).json({ error: 'Invalid produce_id: Produce not found' });
//     }
//     const [agent] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [salesAgentId]);
//     console.log('POST /credit_sales: agent =', agent);
//     if (!agent.length) {
//       return res.status(400).json({ error: 'Invalid sales_agent_id: Agent not found' });
//     }

//     // Basic validation
//     if (!buyerName || !nationalId || !location) {
//       return res.status(400).json({ error: 'Buyer name, national ID, and location are required' });
//     }
//     if (!amountDue || amountDue <= 0) {
//       return res.status(400).json({ error: 'Amount due must be greater than 0' });
//     }
//     if (!dueDate) {
//       return res.status(400).json({ error: 'Due date is required' });
//     }
//     if (!tonnage || tonnage <= 0) {
//       return res.status(400).json({ error: 'Tonnage must be greater than 0' });
//     }
//     if (status && !['pending', 'paid'].includes(status)) {
//       return res.status(400).json({ error: 'Status must be "pending" or "paid"' });
//     }

//     const [result] = await db.query(
//       `INSERT INTO credit_sales (
//         buyer_name,
//         national_id,
//         location,
//         amount_due,
//         due_date,
//         produce_id,
//         tonnage,
//         status,
//         sales_agent_id
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         buyerName.trim(),
//         nationalId.trim(),
//         location.trim(),
//         parseFloat(amountDue), // Matches DECIMAL(10,2)
//         dueDate,
//         parseInt(produceId),
//         parseFloat(tonnage),
//         status || 'pending',
//         parseInt(salesAgentId),
//       ]
//     );
//     console.log('POST /credit_sales: insertId =', result.insertId);

//     // Emit WebSocket event
//     const io = req.app.get('socketio');
//     if (!io) {
//       console.warn('POST /credit_sales: Socket.IO not initialized');
//     } else {
//       io.emit('data-updated', { type: 'credit_sales' });
//     }

//     const creditSale = {
//       creditSaleId: result.insertId,
//       buyerName,
//       nationalId,
//       location,
//       amountDue: parseFloat(amountDue),
//       dueDate,
//       produceId,
//       tonnage,
//       status: status || 'pending',
//       salesAgentId,
//     };

//     res.status(201).json({
//       message: 'Credit sale recorded successfully',
//       creditSaleId: creditSale.creditSaleId,
//       data: creditSale,
//     });
//   } catch (error) {
//     console.error('POST /credit_sales error:', {
//       message: error.message,
//       stack: error.stack,
//       code: error.code,
//       sqlMessage: error.sqlMessage,
//     });
//     if (error.code === 'ER_NO_REFERENCED_ROW_2') {
//       return res.status(400).json({ error: 'Foreign key violation: Invalid produce_id or sales_agent_id' });
//     }
//     if (error.code === 'ER_DUP_ENTRY') {
//       return res.status(400).json({ error: 'Duplicate entry detected' });
//     }
//     if (error.code === 'ER_BAD_FIELD_ERROR') {
//       return res.status(400).json({ error: 'Database schema error: Unknown column' });
//     }
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// router.get('/', authenticateToken, async (req, res) => {
//   try {
//     console.log('GET /credit_sales: req.user =', req.user);
//     const [rows] = await db.query(
//       `SELECT 
//         cs.credit_sale_id,
//         cs.buyer_name,
//         cs.national_id,
//         cs.location,
//         cs.amount_due,
//         cs.due_date,
//         cs.produce_id,
//         p.name AS produceName,
//         cs.tonnage,
//         cs.status,
//         cs.sales_agent_id,
//         u.username AS salesAgentName
//       FROM credit_sales cs
//       JOIN produce p ON cs.produce_id = p.produce_id
//       JOIN users u ON cs.sales_agent_id = u.user_id
//       WHERE cs.sales_agent_id = ?`,
//       [req.user.user_id]
//     );
//     console.log('GET /credit_sales: rows =', rows);
//     res.json({
//       total: rows.length,
//       data: rows.map(row => ({
//         creditSaleId: row.credit_sale_id,
//         buyerName: row.buyer_name,
//         nationalId: row.national_id,
//         location: row.location,
//         amountDue: parseFloat(row.amount_due), // Ensure decimal
//         dueDate: row.due_date,
//         produceId: row.produce_id,
//         produceName: row.produceName,
//         tonnage: parseFloat(row.tonnage),
//         status: row.status,
//         salesAgentId: row.sales_agent_id,
//         salesAgentName: row.salesAgentName,
//       })),
//     });
//   } catch (error) {
//     console.error('GET /credit_sales error:', {
//       message: error.message,
//       stack: error.stack,
//       code: error.code,
//       sqlMessage: error.sqlMessage,
//     });
//     if (error.code === 'ER_BAD_FIELD_ERROR') {
//       return res.status(400).json({ error: 'Database schema error: Unknown column' });
//     }
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// router.get('/:id', authenticateToken, async (req, res) => {
//   try {
//     console.log('GET /credit_sales/:id: req.user =', req.user, 'id =', req.params.id);
//     const [rows] = await db.query(
//       `SELECT 
//         cs.credit_sale_id,
//         cs.buyer_name,
//         cs.national_id,
//         cs.location,
//         cs.amount_due,
//         cs.due_date,
//         cs.produce_id,
//         p.name AS produceName,
//         cs.tonnage,
//         cs.status,
//         cs.sales_agent_id,
//         u.username AS salesAgentName
//       FROM credit_sales cs
//       JOIN produce p ON cs.produce_id = p.produce_id
//       JOIN users u ON cs.sales_agent_id = u.user_id
//       WHERE cs.credit_sale_id = ? AND cs.sales_agent_id = ?`,
//       [req.params.id, req.user.user_id]
//     );
//     console.log('GET /credit_sales/:id: rows =', rows);
//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Credit sale not found' });
//     }
//     const row = rows[0];
//     res.json({
//       creditSaleId: row.credit_sale_id,
//       buyerName: row.buyer_name,
//       nationalId: row.national_id,
//       location: row.location,
//       amountDue: parseFloat(row.amount_due),
//       dueDate: row.due_date,
//       produceId: row.produce_id,
//       produceName: row.produceName,
//       tonnage: parseFloat(row.tonnage),
//       status: row.status,
//       salesAgentId: row.sales_agent_id,
//       salesAgentName: row.salesAgentName,
//     });
//   } catch (error) {
//     console.error('GET /credit_sales/:id error:', {
//       message: error.message,
//       stack: error.stack,
//       code: error.code,
//       sqlMessage: error.sqlMessage,
//     });
//     if (error.code === 'ER_BAD_FIELD_ERROR') {
//       return res.status(400).json({ error: 'Database schema error: Unknown column' });
//     }
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// module.exports = router; 

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/authJWT');

router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('POST /credit_sales: req.body =', req.body);
    console.log('POST /credit_sales: req.user =', req.user);
    const {
      buyerName,
      nationalId,
      location,
      amountDue,
      dueDate,
      produceId,
      tonnage,
      status,
      salesAgentId,
    } = req.body;

    // Validate foreign keys
    const [produce] = await db.query('SELECT produce_id FROM produce WHERE produce_id = ?', [produceId]);
    console.log('POST /credit_sales: produce =', produce);
    if (!produce.length) {
      return res.status(400).json({ error: 'Invalid produce_id: Produce not found' });
    }
    const [agent] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [salesAgentId]);
    console.log('POST /credit_sales: agent =', agent);
    if (!agent.length) {
      return res.status(400).json({ error: 'Invalid sales_agent_id: Agent not found' });
    }

    // Basic validation
    if (!buyerName || !nationalId || !location) {
      return res.status(400).json({ error: 'Buyer name, national ID, and location are required' });
    }
    if (!amountDue || amountDue <= 0) {
      return res.status(400).json({ error: 'Amount due must be greater than 0' });
    }
    if (!dueDate) {
      return res.status(400).json({ error: 'Due date is required' });
    }
    if (!tonnage || tonnage <= 0) {
      return res.status(400).json({ error: 'Tonnage must be greater than 0' });
    }
    if (status && !['pending', 'paid'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "pending" or "paid"' });
    }

    const [result] = await db.query(
      `INSERT INTO credit_sales (
        buyer_name,
        national_id,
        location,
        amount_due,
        due_date,
        produce_id,
        tonnage,
        status,
        sales_agent_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        buyerName.trim(),
        nationalId.trim(),
        location.trim(),
        parseFloat(amountDue),
        dueDate,
        parseInt(produceId),
        parseFloat(tonnage),
        status || 'pending',
        parseInt(salesAgentId),
      ]
    );
    console.log('POST /credit_sales: insertId =', result.insertId);

    // Emit WebSocket event
    const io = req.app.get('socketio');
    if (!io) {
      console.warn('POST /credit_sales: Socket.IO not initialized');
    } else {
      io.emit('data-updated', { type: 'credit_sales' });
    }

    const creditSale = {
      creditSaleId: result.insertId,
      buyerName,
      nationalId,
      location,
      amountDue: parseFloat(amountDue),
      dueDate,
      produceId,
      tonnage,
      status: status || 'pending',
      salesAgentId,
    };

    res.status(201).json({
      message: 'Credit sale recorded successfully',
      creditSaleId: creditSale.creditSaleId,
      data: creditSale,
    });
  } catch (error) {
    console.error('POST /credit_sales error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Foreign key violation: Invalid produce_id or sales_agent_id' });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Duplicate entry detected' });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({ error: 'Database schema error: Unknown column' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('GET /credit_sales: req.user =', req.user);
    const isPrivileged = ['ceo', 'manager'].includes(req.user.role);
    const query = isPrivileged
      ? `SELECT 
           cs.credit_sale_id, cs.buyer_name, cs.national_id, cs.location, cs.amount_due, cs.due_date,
           cs.produce_id, p.name AS produceName, cs.tonnage, cs.status, cs.sales_agent_id, u.username AS salesAgentName
         FROM credit_sales cs
         JOIN produce p ON cs.produce_id = p.produce_id
         JOIN users u ON cs.sales_agent_id = u.user_id`
      : `SELECT 
           cs.credit_sale_id, cs.buyer_name, cs.national_id, cs.location, cs.amount_due, cs.due_date,
           cs.produce_id, p.name AS produceName, cs.tonnage, cs.status, cs.sales_agent_id, u.username AS salesAgentName
         FROM credit_sales cs
         JOIN produce p ON cs.produce_id = p.produce_id
         JOIN users u ON cs.sales_agent_id = u.user_id
         WHERE cs.sales_agent_id = ?`;
    const params = isPrivileged ? [] : [req.user.user_id];
    const [rows] = await db.query(query, params);
    console.log('GET /credit_sales: rows =', rows);
    res.json({
      total: rows.length,
      data: rows.map(row => ({
        creditSaleId: row.credit_sale_id,
        buyerName: row.buyer_name,
        nationalId: row.national_id,
        location: row.location,
        amountDue: parseFloat(row.amount_due),
        dueDate: row.due_date,
        produceId: row.produce_id,
        produceName: row.produceName,
        tonnage: parseFloat(row.tonnage),
        status: row.status,
        salesAgentId: row.sales_agent_id,
        salesAgentName: row.salesAgentName,
      })),
    });
  } catch (error) {
    console.error('GET /credit_sales error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({ error: 'Database schema error: Unknown column' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('GET /credit_sales/:id: req.user =', req.user, 'id =', req.params.id);
    const isPrivileged = ['ceo', 'manager'].includes(req.user.role);
    const query = isPrivileged
      ? `SELECT 
           cs.credit_sale_id, cs.buyer_name, cs.national_id, cs.location, cs.amount_due, cs.due_date,
           cs.produce_id, p.name AS produceName, cs.tonnage, cs.status, cs.sales_agent_id, u.username AS salesAgentName
         FROM credit_sales cs
         JOIN produce p ON cs.produce_id = p.produce_id
         JOIN users u ON cs.sales_agent_id = u.user_id
         WHERE cs.credit_sale_id = ?`
      : `SELECT 
           cs.credit_sale_id, cs.buyer_name, cs.national_id, cs.location, cs.amount_due, cs.due_date,
           cs.produce_id, p.name AS produceName, cs.tonnage, cs.status, cs.sales_agent_id, u.username AS salesAgentName
         FROM credit_sales cs
         JOIN produce p ON cs.produce_id = p.produce_id
         JOIN users u ON cs.sales_agent_id = u.user_id
         WHERE cs.credit_sale_id = ? AND cs.sales_agent_id = ?`;
    const params = isPrivileged ? [req.params.id] : [req.params.id, req.user.user_id];
    const [rows] = await db.query(query, params);
    console.log('GET /credit_sales/:id: rows =', rows);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Credit sale not found' });
    }
    const row = rows[0];
    res.json({
      creditSaleId: row.credit_sale_id,
      buyerName: row.buyer_name,
      nationalId: row.national_id,
      location: row.location,
      amountDue: parseFloat(row.amount_due),
      dueDate: row.due_date,
      produceId: row.produce_id,
      produceName: row.produceName,
      tonnage: parseFloat(row.tonnage),
      status: row.status,
      salesAgentId: row.sales_agent_id,
      salesAgentName: row.salesAgentName,
    });
  } catch (error) {
    console.error('GET /credit_sales/:id error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({ error: 'Database schema error: Unknown column' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;