const express = require('express');
const router = express.Router();
const {viewDetailsCustomer,viewRegisterDevices,viewSoldDevices,viewShops,viewEmployees}=require('../controler/details-controler')


router.post('/customer',viewDetailsCustomer);
router.post('/devices',viewRegisterDevices);
router.post('/solddevice',viewSoldDevices);
router.post('/shops',viewShops);
router.post('/employee',viewEmployees);


module.exports = router;