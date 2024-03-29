const express = require('express');
const { connectToDB } = require('./dbconnection');
const customerRoute = require('./route/customer');
const adminRoute = require('./route/admin');
const user=require('./route/user-route')
const device=require('./route/devices-route')
const image=require('./uploadingfile');
const otp=require('./otp');
const emi=require('./route/installmen-route');
const employee=require('./route/employee-route');
const fund=require('./route/fund-transfer');
const wallet=require('./route/wallet-route')
const sms=require('./route/sms-route')
const adhar=require('./adhar')
const details=require('./route/details-route')
const forgetPassword=require('./route/forget-password-route');
const brand=require('./route/brand-route')
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
app.use('/emi',emi);
app.use('/employee',employee);
app.use('/fund',fund)
app.use('/wallet',wallet)
app.use('/api',otp);
app.use('/sms',sms);
app.use('/adhar',adhar);
app.use('/forget',forgetPassword);
app.use('/details',details);
app.use('/brand',brand);


app.get('/', (req, res) => {
    res.send('Welcome');
});

app.listen(port, () => {
    console.log('Server is running on port ', port);
});
