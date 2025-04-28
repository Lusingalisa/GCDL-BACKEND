// const db = require('../config/db');
// const roles = require('../config/roles');

// // Get all users (only accessible by CEO and managers)
// exports.getAllUsers = async (req, res) => {
//   try {
//     const [users] = await db.query('SELECT user_id, username, email, role, branch_id FROM users');
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Update user role (only accessible by CEO)
// exports.updateUserRole = async (req, res) => {
//   const { user_id } = req.params;
//   const { role } = req.body;

//   try {
//     // Validate the requested role
//     if (!Object.values(roles.ROLES).includes(role)) {
//       return res.status(400).json({ error: 'Invalid role' });
//     }

//     // Only CEO can change roles
//     if (req.user.role !== 'ceo') {
//       return res.status(403).json({ error: 'Only CEO can change user roles' });
//     }

//     await db.query('UPDATE users SET role = ? WHERE user_id = ?', [role, user_id]);
//     res.json({ message: 'User role updated successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Delete user (only accessible by CEO)
// exports.deleteUser = async (req, res) => {
//   const { user_id } = req.params;

//   try {
//     // Only CEO can delete users
//     if (req.user.role !== 'ceo') {
//       return res.status(403).json({ error: 'Only CEO can delete users' });
//     }

//     await db.query('DELETE FROM users WHERE user_id = ?', [user_id]);
//     res.json({ message: 'User deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// backend/controllers/userController.js
const db = require('../config/db');

const userController = {
  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const [users] = await db.query(`
        SELECT user_id, username, email, role, branch_id, created_at
        FROM users
      `);
      res.json({
        total: users.length,
        data: users,
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  },

  // Update user role
  updateUserRole: async (req, res) => {
    const { user_id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['ceo', 'manager', 'sales_agent'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be ceo, manager, or sales_agent' });
    }

    try {
      const [user] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      await db.query('UPDATE users SET role = ? WHERE user_id = ?', [role, user_id]);
      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    const { user_id } = req.params;

    try {
      const [user] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      await db.query('DELETE FROM users WHERE user_id = ?', [user_id]);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  },
};

module.exports = userController;