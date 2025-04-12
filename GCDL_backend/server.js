const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes= require('./routes/auth');
const stockRoutes = require('./routes/stock');
const salesRoutes = require('./routes/sales');
const procumentRoutes = require('./routes/procurements')

require('dotenv').config();


app.use('/api',procumentRoutes);
app.use('/api',salesRoutes);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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


