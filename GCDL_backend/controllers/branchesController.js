const db = require('../config/db');

exports.getAllBranches = async (req, res) => {
  try {
    const [branches] = await db.query('SELECT * FROM branches');
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createBranch = async (req, res) => {
  const { branch_name } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO branches (branch_name) VALUES (?)',
      [branch_name]
    );
    res.status(201).json({ branch_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add similar methods for getById, update, delete