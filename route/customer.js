const express = require('express');
const router = express.Router();
const {customerRegister,customerList,viewAllData,filterCustomer,verifyCustomer,isCustomerPresent}=require('../controler/customer-registration')


router.post('/register',customerRegister);
router.post('/list',customerList);
router.post('/profile',viewAllData);
router.post('/filter',filterCustomer);
router.post('/verify',verifyCustomer);
router.post('/check/customer',isCustomerPresent);


module.exports = router;