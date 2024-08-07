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
const brand=require('./route/brand-route');
const shop=require('././route/shops-route');
const city=require('./route/cites');
const guarantor=require('./route/guarantor-route');
const contactus=require('./route/contactus-route');
const pdf=require('./route/pdf-route');
const profile=require('./route/profile-route');
const files=require('./route/files-route');
const dailyCollection=require('./route/dailyCollectionRoute');
const imgaeUpload=require('./uploadsAndAPIS/gaurantor-images');
const cors=require('cors');
const paytm = require('./payment/paytmpg');
const bodyParser = require('body-parser');
const lockunlock=require('./automode/lock-unlock');
const penality=require('./automode/penality');
const reminder=require('./automode/remindersms')
const appRoute=require('./route/app-routes');
const paymentRoutes=require('./route/payment-routes');
const homeAppliance=require('./route/home-appliances-route');
require('dotenv').config();
connectToDB();
const port = process.env.PORT || 4000;
const app = express();
// const corsOptions = {
//     origin: 'https://mobilefinder.store', // Replace with your allowed origin
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// };
// app.use(cors(corsOptions));
app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/customer', customerRoute);
app.use('/api', adminRoute); 
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
app.use('/shops',shop)
app.use('/api',city);
app.use('/api', paytm);
app.use('/guarantor', guarantor);
app.use('/conactus',contactus);
app.use('/pdf',pdf);
app.use('/profile',profile);
app.use('/files',files);
app.use('/collection',dailyCollection);
app.use('/guarantor',imgaeUpload)
app.use('/customer',appRoute);
app.use('/payment',paymentRoutes);
app.use('/home',homeAppliance);


app.get('/', (req, res) => {
    res.send('Welcome home api');
});

app.listen(port, () => {
    console.log('Server is running on port ', port);
});
