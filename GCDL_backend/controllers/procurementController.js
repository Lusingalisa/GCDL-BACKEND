const db = require('../config/db');

exports.createProcurement = async (req, res) => {
  const { produce_id, type, date, time, tonnage, cost, dealer_name, branch_id, contact, selling_price } = req.body;
  
  try {
    const [result] = await db.query(
      `INSERT INTO procurement 
      (produce_id, type, date, time, tonnage, cost, dealer_name, branch_id, contact, selling_price) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [produce_id, type, date, time, tonnage, cost, dealer_name, branch_id, contact, selling_price]
    );
    
    // Update stock
    await db.query(
      `INSERT INTO stock (produce_id, branch_id, quantity) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [produce_id, branch_id, tonnage]
    );
    
    res.status(201).json({ procurement_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProcurementsByBranch = async (req, res) => {
  const { branch_id } = req.params;
  
  try {
    const [procurements] = await db.query(
      `SELECT p.*, pr.name as produce_name 
      FROM procurement p
      JOIN produce pr ON p.produce_id = pr.produce_id
      WHERE p.branch_id = ?`,
      [branch_id]
    );
    res.json(procurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add more procurement methods