const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController'); // Adjust path if needed
const authenticateToken = require('../middleware/authJWT'); 
const { hasPermission } = require('../middleware/roleCheck');


// Get stock by branch
router.get('/branch/:branch_id', 
    authenticateToken,
    hasPermission('VIEW_STOCK'),
    stockController.getStockByBranch
  );
  
  // Get low stock
  router.get('/low',
    authenticateToken,
    hasPermission('VIEW_STOCK'),
    stockController.getLowStock
  );

  // Update stock
router.post('/update',
  authenticateToken,
  hasPermission('UPDATE_STOCK'),
  stockController.updateStock
);

// Reduce stock
router.post('/reduce',
  authenticateToken,
  hasPermission('UPDATE_STOCK'),
  stockController.reduceStock
);

// Delete stock record
router.delete('/:stock_id',
  authenticateToken,
  hasPermission('DELETE_STOCK'),
  stockController.deleteStock
);

module.exports = router;

// Adjust path if needed

// // Get stock by branch
// router.get('/branch/:branch_id', authenticateToken, stockController.getStockByBranch);

// // Get low stock across all branches
// router.get('/low', authenticateToken, stockController.getLowStock);

// // Create or update stock (e.g., after procurement)
// router.post('/update', authenticateToken, stockController.updateStock);

// // Reduce stock (e.g., after a sale)
// router.post('/reduce', authenticateToken, stockController.reduceStock);

// // Delete stock record (optional, for manual adjustments)
// router.delete('/:stock_id', authenticateToken, stockController.deleteStock);

// module.exports = router;