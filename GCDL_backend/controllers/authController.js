const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  const { username, email, password, role, branch_id } = req.body;
  
  try {
    // Check if user exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role, branch_id) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, branch_id]
    );
    
    res.status(201).json({ 
      user_id: result.insertId,
      message: 'User registered successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        role: user.role, 
        branch_id: user.branch_id 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ 
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
