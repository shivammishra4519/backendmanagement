const {adminlogin}=require('../controler/admin-controler')
const express = require('express');
const router = express.Router();


router.post('/login',adminlogin);


module.exports = router;