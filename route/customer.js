const express = require('express');
const router = express.Router();
const {customerRegister,customerList,viewAllData,filterCustomer}=require('../controler/customer-registration')


router.post('/register',customerRegister);
router.post('/list',customerList);
router.post('/profile',viewAllData);
router.post('/filter',filterCustomer);


module.exports = router;