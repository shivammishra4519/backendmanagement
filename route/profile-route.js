const express = require('express');
const router = express.Router();
const {getUserBytoken,changePassWord,changePin,updateAddress,checkOtherDEtails,updateOtherDetails}=require('../controler/profile-controler')


router.post('/find',getUserBytoken);
router.post('/password/chanage',changePassWord);
router.post('/pin/chanage',changePin);
router.post('/update/address',updateAddress);
router.post('/check/otherdetails',checkOtherDEtails);
router.post('/update/otherdetails',updateOtherDetails);




module.exports = router;