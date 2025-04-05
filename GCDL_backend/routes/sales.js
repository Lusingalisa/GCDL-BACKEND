

// const express = require('express');
// const router = express.Router();
// const salesController = require('../controllers/salesController');
// const authenticateToken = require('../middleware/authJWT');
// const { hasPermission } = require('../middleware/roleCheck');

// // Create a new sale
// router.post('/',
//   authenticateToken,
//   hasPermission('CREATE_SALE'),
//   salesController.createSale
// );

// // Get sales by agent ID
// router.get('/agent/:id',
//   authenticateToken,
//   hasPermission('VIEW_OWN_SALES'),
//   salesController.getSalesByAgent
// );

// // Get all sales (for managers/CEO)
// router.get('/',
//   authenticateToken,
//   hasPermission('VIEW_ALL_SALES'),
//   salesController.getAllSales
// );

// // Get sales by branch
// router.get('/branch/:branch_id',
//   authenticateToken,
//   hasPermission('VIEW_ALL_SALES'),
//   salesController.getSalesByBranch
// );

// // Get a single sale by ID
// router.get('/:sale_id',
//   authenticateToken,
//   salesController.getSaleById
// );

// // Update a sale (for corrections)
// router.put('/:sale_id',
//   authenticateToken,
//   hasPermission('UPDATE_SALE'),
//   salesController.updateSale
// );

// // Delete a sale
// router.delete('/:sale_id',
//   authenticateToken,
//   hasPermission('DELETE_SALE'),
//   salesController.deleteSale
// );

// module.exports = router;

// routes/sales.js
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authenticateToken } = require('../middleware/authJWT');
const { hasPermission } = require('../middleware/roleCheck');

// Apply middleware directly without any wrapping functions
router.post('/', 
  authenticateToken,
  hasPermission('CREATE_SALE'),
  salesController.createSale
);

router.get('/agent/:id',
  authenticateToken,
  hasPermission('VIEW_OWN_SALES'),
  salesController.getSalesByAgent
);

router.get('/',
  authenticateToken,
  hasPermission('VIEW_ALL_SALES'),
  salesController.getAllSales
);

router.get('/branch/:branch_id',
  authenticateToken,
  hasPermission('VIEW_ALL_SALES'),
  salesController.getSalesByBranch
);

router.get('/:sale_id',
  authenticateToken,
  salesController.getSaleById
);

router.put('/:sale_id',
  authenticateToken,
  hasPermission('UPDATE_SALE'),
  salesController.updateSale
);

router.delete('/:sale_id',
  authenticateToken,
  hasPermission('DELETE_SALE'),
  salesController.deleteSale
);

module.exports = router;