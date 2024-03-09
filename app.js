const express = require('express');
const { connectToDB } = require('./dbconnection');
const customerRoute = require('./route/customer');
const adminRoute = require('./route/admin');
const user=require('./route/user-route')
const device=require('./route/devices-route')
const image=require('./uploadingfile')
const cors=require('cors')
const bodyParser = require('body-parser');
require('dotenv').config();

connectToDB();

const port = process.env.PORT || 4000;
const app = express();
app.use(cors())
app.use(bodyParser.json({ extended: true }));
// Use the customer route
app.use('/customer', customerRoute); // Use '/customer' instead of 'customer'
app.use('/api', adminRoute); // Use '/customer' instead of 'customer'
app.use('/api',image);
app.use('/api',user);
app.use('/api',device);


app.get('/', (req, res) => {
    res.send('Welcome');
});

app.listen(port, () => {
    console.log('Server is running on port ', port);
});
