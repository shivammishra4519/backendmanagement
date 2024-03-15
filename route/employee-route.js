const express = require('express');
const router = express.Router();
const {employeeRegister}=require('../controler/employee-controler')


router.post('/register',employeeRegister);

module.exports=router;