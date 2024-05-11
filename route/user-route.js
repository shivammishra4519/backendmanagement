const express = require('express');
const router = express.Router();
const {registerUser,getUser,getUserList,updateStatus,walletCheckUser,findShopByShopNameOrNumber}=require('../controler/user-controler');


router.post('/register',registerUser);
router.post('/getuser',getUser);
router.post('/getuserlist',getUserList);
router.post('/updatestatus',updateStatus);
router.post('/wallet/user',walletCheckUser);
router.post('/find/shop',findShopByShopNameOrNumber);

module.exports=router;