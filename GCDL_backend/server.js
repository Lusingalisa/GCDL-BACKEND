const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware - Apply before routes
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (optional)

// Route imports
const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stock');
const salesRoutes = require('./routes/sales');
const procurementRoutes = require('./routes/procurements');
const creditSalesRoutes = require('./routes/credit-sales');
const produceRoutes = require('./routes/produce');
const branchesRoutes = require('./routes/branches');



// Mount routes with clear prefixes
app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/procurements', procurementRoutes);
app.use('/api/credit-sales', creditSalesRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/branches', branchesRoutes);


// Root route for testing
app.get('/', (req, res) => {
    res.send('GCDL Backend with MySQL is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});