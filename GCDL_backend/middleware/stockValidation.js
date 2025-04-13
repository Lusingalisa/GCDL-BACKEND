const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rolechecker');
const { validateStock } = require('../middleware/stockValidation');
const {
    getAllStock,
    getStockById,
    createOrUpdateStock,
    updateStock,
    deleteStock
} = require('../controllers/stockController');

router.get('/', authenticate, getAllStock);
router.get('/:id', authenticate, getStockById);
router.post('/', authenticate, restrictTo('manager', 'ceo'), validateStock, createOrUpdateStock);
router.put('/:id', authenticate, restrictTo('manager', 'ceo'), validateStock, updateStock);
router.delete('/:id', authenticate, restrictTo('manager', 'ceo'), deleteStock);

module.exports = router;