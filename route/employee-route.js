const express = require('express');
const router = express.Router();
const {employeeRegister,getEmployeeList}=require('../controler/employee-controler')


router.post('/register',employeeRegister);
router.post('/list',getEmployeeList);

module.exports=router;