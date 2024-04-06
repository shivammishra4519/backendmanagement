const express = require('express');
const router = express.Router();
const {customerRegister,customerList,viewAllData,filterCustomer,verifyCustomer}=require('../controler/customer-registration')


router.post('/register',customerRegister);
router.post('/list',customerList);
router.post('/profile',viewAllData);
router.post('/filter',filterCustomer);
router.post('/verify',verifyCustomer);


module.exports = router;