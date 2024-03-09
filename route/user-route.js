const express = require('express');
const router = express.Router();
const {registerUser}=require('../controler/user-controler');


router.post('/register',registerUser);

module.exports=router;