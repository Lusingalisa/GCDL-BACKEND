const express = require('express');
const cors = require('cors');

const authRoutes= require('./routes/auth');
const stockRoutes = require('./routes/stock');
const salesRoutes = require('./routes/sales');
const procumentRoutes = require('./routes/procurements');
const userRoutes=require('./routes/user');
const produceRoutes=require('./routes/produce');
const UsersFRoutes=require('./routes/UsersF');

require('dotenv').config();

app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // If using cookies/sessions
  }));


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

app.use('/api',procumentRoutes);
app.use('/api',salesRoutes);
app.use('/api/auth', authRoutes );
app.use('/api/users', userRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/users', UsersFRoutes);
app.use('/api/stock', stockRoutes);


app.use('/api/credit-sales', creditSalesRoutes);



// Root route for testing
app.get('/', (req, res) => {
    res.send('GCDL Backend with MySQL is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});