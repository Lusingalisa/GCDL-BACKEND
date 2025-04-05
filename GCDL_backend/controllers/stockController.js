const db = require('../config/db');

exports.getStockByBranch = async (req, res) => {
  const { branch_id } = req.params;
  
  try {
    const [stock] = await db.query(
      `SELECT s.*, p.name as produce_name, p.type as produce_type 
      FROM stock s
      JOIN produce p ON s.produce_id = p.produce_id
      WHERE s.branch_id = ?`,
      [branch_id]
    );
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLowStock = async (req, res) => {
  const threshold = req.query.threshold || 10; // Default threshold of 10 tons
  
  try {

    if (isNaN(threshold) || threshold < 0) {
        return res.status(400).json({ error: 'Invalid threshold value' });
    }

    const [stock] = await db.query(
      `SELECT s.*, p.name as produce_name, b.branch_name 
      FROM stock s
      JOIN produce p ON s.produce_id = p.produce_id
      JOIN branches b ON s.branch_id = b.branch_id
      WHERE s.quantity < ?`,
      [threshold]
    );

    if (stock.length === 0) {
        return res.status(404).json({ message: 'No low stock items found' });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create or update stock (e.g., after procurement)
exports.updateStock = async (req, res) => {
    const { produce_id, branch_id, quantity } = req.body;
  
    try {
      // Validate inputs
      if (!produce_id || !branch_id || !quantity || isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ error: 'Invalid input: produce_id, branch_id, and quantity are required and must be valid' });
      }
  
      // Check if stock record exists
      const [existingStock] = await db.query(
        'SELECT * FROM stock WHERE produce_id = ? AND branch_id = ?',
        [produce_id, branch_id]
      );
      if (existingStock.length > 0) {
        // Update existing stock
        const newQuantity = existingStock[0].quantity + parseFloat(quantity);
        await db.query(
          'UPDATE stock SET quantity = ? WHERE stock_id = ?',
          [newQuantity, existingStock[0].stock_id]
        );
        res.status(200).json({ message: 'Stock updated successfully', stock_id: existingStock[0].stock_id });
      } else {
        // Insert new stock record
        const [result] = await db.query(
          'INSERT INTO stock (produce_id, branch_id, quantity) VALUES (?, ?, ?)',
          [produce_id, branch_id, quantity]
        );
        res.status(201).json({ message: 'Stock created successfully', stock_id: result.insertId });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// Reduce stock (e.g., after a sale)
exports.reduceStock = async (req, res) => {
    const { produce_id, branch_id, quantity } = req.body;
  
    try {
      // Validate inputs
      if (!produce_id || !branch_id || !quantity || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid input: produce_id, branch_id, and quantity are required and must be valid' });
      }
  
      // Check current stock
      const [stock] = await db.query(
        'SELECT * FROM stock WHERE produce_id = ? AND branch_id = ?',
        [produce_id, branch_id]
      );
  
      if (stock.length === 0) {
        return res.status(404).json({ error: 'No stock found for this produce and branch' });
      }
  
      const currentQuantity = stock[0].quantity;
      if (currentQuantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock available' });
      }
      // Reduce stock
    const newQuantity = currentQuantity - parseFloat(quantity);
    await db.query(
      'UPDATE stock SET quantity = ? WHERE stock_id = ?',
      [newQuantity, stock[0].stock_id]
    );

    res.status(200).json({ message: 'Stock reduced successfully', stock_id: stock[0].stock_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete stock record (optional, for manual adjustments)
exports.deleteStock = async (req, res) => {
    const { stock_id } = req.params;
  
    try {
      // Validate stock_id
      if (!stock_id || isNaN(stock_id)) {
        return res.status(400).json({ error: 'Invalid stock_id' });
      }
  
      const [result] = await db.query(
        'DELETE FROM stock WHERE stock_id = ?',
        [stock_id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Stock record not found' });
      }
  
      res.status(200).json({ message: 'Stock record deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
module.exports = exports;

// Add more stock methods