const express = require('express');
const app = express();
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


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/stock', stockRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api',procumentRoutes);
app.use('/api',salesRoutes);
app.use('/api/auth', authRoutes );
app.use('/api/users', userRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/users', UsersFRoutes);

app.get('/',(req,res)=>{
    res.send('GCDL Backend with MySQL is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



