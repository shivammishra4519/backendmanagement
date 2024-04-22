const express = require('express');
const router = express.Router();
const {getUserBytoken,changePassWord}=require('../controler/profile-controler')


router.post('/find',getUserBytoken);
router.post('/password/chnage',changePassWord);




module.exports = router;