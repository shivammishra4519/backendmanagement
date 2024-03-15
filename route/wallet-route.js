const express = require('express');
const router = express.Router();
const {checkWalletAmount}=require('../controler/wallet')


router.post('/amount',checkWalletAmount);

module.exports=router;