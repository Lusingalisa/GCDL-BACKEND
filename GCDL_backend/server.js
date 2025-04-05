const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const authRoutes= require('./routes/auth');
const stockRoutes = require('./routes/stock');
const salesRoutes = require('./routes/sales');

require('dotenv').config();
const procumentRoutes = require('./routes/procurements')
const salesRoutes =require('./routes/sales')

app.use('/api',procumentRoutes);
app.use('/api',salesRoutes);



app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/sales', salesRoutes);

app.get('/',(req,res)=>{
    res.send('GCDL Backend with MySQL is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.use('/api', authRoutes);


