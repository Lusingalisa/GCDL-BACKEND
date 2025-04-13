const db = require('../config/db');

exports.createCreditSale = async (req, res) => {
  const { buyer_name, national_id, location, amount_due, due_date, produce_id, tonnage } = req.body;
  
  try {
    const [result] = await db.query(
      `INSERT INTO credit_sales 
      (buyer_name, national_id, location, amount_due, due_date, produce_id, tonnage) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [buyer_name, national_id, location, amount_due, due_date, produce_id, tonnage]
    );
    
    res.status(201).json({ credit_sale_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCreditSaleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await db.query(
      'UPDATE credit_sales SET status = ? WHERE credit_sale_id = ?',
      [status, id]
    );
    res.json({ message: 'Credit sale status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add more credit sales methods