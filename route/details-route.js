const express = require('express');
const router = express.Router();
const {viewDetailsCustomer,viewRegisterDevices,viewSoldDevices,viewShops,viewEmployees,allCreadit,allUsersWallet,allEmployeeWallet,totalFileCharge}=require('../controler/details-controler')


router.post('/customer',viewDetailsCustomer);
router.post('/devices',viewRegisterDevices);
router.post('/solddevice',viewSoldDevices);
router.post('/shops',viewShops);
router.post('/employee',viewEmployees);
router.post('/credit',allCreadit);
router.post('/users/wallet',allUsersWallet);
router.post('/employee/wallet',allEmployeeWallet);
router.post('/total/filecharge',totalFileCharge);


module.exports = router;