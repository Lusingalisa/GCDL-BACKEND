const db = require('../config/db');

exports.getAllProduce = async (req, res) => {
  try {
    const [produce] = await db.query('SELECT * FROM produce');
    res.json(produce);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduce = async (req, res) => {
  const { name, type } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO produce (name, type) VALUES (?, ?)',
      [name, type]
    );
    res.status(201).json({ produce_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add similar methods for getById, update, delete