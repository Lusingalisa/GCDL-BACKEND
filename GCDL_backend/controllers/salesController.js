const db = require('../config/db');

exports.createSale = async (req, res) => {
  const { produce_id, tonnage, amount_paid, buyer_name, date, time, buyer_contact, receipt_url } = req.body;
  const sales_agent_id = req.user.user_id;
  const branch_id = req.user.branch_id;
  
  try {
    // Check stock availability
    const [stock] = await db.query(
      'SELECT quantity FROM stock WHERE produce_id = ? AND branch_id = ?',
      [produce_id, branch_id]
    );
    
    if (stock.length === 0 || stock[0].quantity < tonnage) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Record sale
    const [result] = await db.query(
      `INSERT INTO sales 
      (produce_id, tonnage, amount_paid, buyer_name, sales_agent_id, date, time, buyer_contact, receipt_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [produce_id, tonnage, amount_paid, buyer_name, sales_agent_id, date, time, buyer_contact, receipt_url]
    );
    
    // Update stock
    await db.query(
      'UPDATE stock SET quantity = quantity - ? WHERE produce_id = ? AND branch_id = ?',
      [tonnage, produce_id, branch_id]
    );
    
    res.status(201).json({ sale_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSalesByAgent = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [sales] = await db.query(
      `SELECT s.*, p.name as produce_name 
      FROM sales s
      JOIN produce p ON s.produce_id = p.produce_id
      WHERE s.sales_agent_id = ?`,
      [id]
    );
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// In salesController.js

exports.getAllSales = async (req, res) => {
    try {
      const [sales] = await db.query(
        `SELECT s.*, p.name as produce_name, u.username as agent_name 
        FROM sales s
        JOIN produce p ON s.produce_id = p.produce_id
        JOIN users u ON s.sales_agent_id = u.user_id`
      );
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.getSalesByBranch = async (req, res) => {
    const { branch_id } = req.params;
    try {
      const [sales] = await db.query(
        `SELECT s.*, p.name as produce_name 
        FROM sales s
        JOIN produce p ON s.produce_id = p.produce_id
        JOIN users u ON s.sales_agent_id = u.user_id
        WHERE u.branch_id = ?`,
        [branch_id]
      );
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.getSaleById = async (req, res) => {
    const { sale_id } = req.params;
    try {
      const [sales] = await db.query(
        `SELECT s.*, p.name as produce_name, u.username as agent_name 
        FROM sales s
        JOIN produce p ON s.produce_id = p.produce_id
        JOIN users u ON s.sales_agent_id = u.user_id
        WHERE s.sale_id = ?`,
        [sale_id]
      );
      if (sales.length === 0) {
        return res.status(404).json({ error: 'Sale not found' });
      }
      res.json(sales[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };