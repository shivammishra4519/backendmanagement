const express = require('express');
const router = express.Router();
const {isAccountPresent,CreateNewPassword}=require('../controler/forget-passsword')

router.post('/check',isAccountPresent);
router.post('/update',CreateNewPassword);


module.exports=router


