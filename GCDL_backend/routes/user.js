const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authJWT');
const userController = require('../controllers/userController');
const {checkRole} = require('../middleware/roleCheck');

// Get all users (accessible by CEO and managers)
router.get('/', 
    authenticateToken,
    checkRole(['ceo','manager']), 
    userController.getAllUsers);

// Update user role (only CEO)
router.patch(
  '/:user_id/role', 
  authenticateToken, 
  checkRole(['ceo']),
  userController.updateUserRole
);

// Delete user (only CEO)
router.delete(
  '/:user_id', 
  authenticateToken, 
  checkRole(['ceo']),
  userController.deleteUser
);

// Add this to your users router
router.get('/sales-agents', authenticateToken, async (req, res) => {
    try {
      // Query to get all users with sales agent role
      const [agents] = await db.query(
        `SELECT user_id, username, role FROM users WHERE role = 'sales_agent'`
      );
      res.json(agents);
    } catch (error) {
      console.error('Error fetching sales agents:', error);
      res.status(500).json({ error: 'Failed to fetch sales agents' });
    }
  });

module.exports = router;