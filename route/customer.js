const express = require('express');
const router = express.Router();
const {customerRegister,customerList,viewAllData,filterCustomer,verifyCustomer,isCustomerPresent,viewCustomerImageName,findCustomerByManyId}=require('../controler/customer-registration')


router.post('/register',customerRegister);
router.post('/list',customerList);
router.post('/profile',viewAllData);
router.post('/filter',filterCustomer);
router.post('/verify',verifyCustomer);
router.post('/check/customer',isCustomerPresent);
router.post('/view/image',viewCustomerImageName);
router.post('/View/loan',findCustomerByManyId);


module.exports = router;