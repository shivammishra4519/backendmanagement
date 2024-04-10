const {login,veirfyToken,fundTransferByadmin,fundReciveByadmin}=require('../controler/admin-controler')
const express = require('express');
const router = express.Router();


router.post('/login',login);
router.post('/verifytoken',veirfyToken);
router.post('/fund/history',fundTransferByadmin);
router.post('/fund/history/recive',fundReciveByadmin);


module.exports = router;