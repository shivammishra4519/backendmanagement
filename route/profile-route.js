const express = require('express');
const router = express.Router();
const {getUserBytoken,changePassWord,changePin,updateAddress}=require('../controler/profile-controler')


router.post('/find',getUserBytoken);
router.post('/password/chanage',changePassWord);
router.post('/pin/chanage',changePin);
router.post('/update/address',updateAddress);




module.exports = router;