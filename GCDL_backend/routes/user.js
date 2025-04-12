const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authJWT');
const userController = require('../controllers/userController');
const {checkRole} = require('../middleware/roleCheck');

// Get all users (accessible by CEO and managers)
router.get('/users', 
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
module.exports = router;