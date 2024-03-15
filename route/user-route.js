const express = require('express');
const router = express.Router();
const {registerUser,getUser,getUserList}=require('../controler/user-controler');


router.post('/register',registerUser);
router.post('/getuser',getUser);
router.post('/getuserlist',getUserList);

module.exports=router;