const {login,veirfyToken}=require('../controler/admin-controler')
const express = require('express');
const router = express.Router();


router.post('/login',login);
router.post('/verifytoken',veirfyToken);


module.exports = router;