const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stock');
const salesRoutes = require('./routes/sales');
const procurementRoutes = require('./routes/procurements'); // Corrected typo
const userRoutes = require('./routes/user');
const produceRoutes = require('./routes/produce');
const UsersFRoutes = require('./routes/UsersF');
const creditSalesRoutes = require('./routes/credit-sales');
const dashboardRoutes = require('./routes/dashboard');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

// Make socket.io available to routes
app.set('socketio', io);

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/sales', salesRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/procurements', procurementRoutes);
app.use('/api/credit-sales', creditSalesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/usersF', UsersFRoutes); // Avoid conflict with userRoutes
app.use('/api/produce', produceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root route for testing
app.get('/', (req, res) => {
  res.send('GCDL Backend with MySQL is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});