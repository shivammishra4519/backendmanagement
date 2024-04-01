const express = require('express');
const router = express.Router();
const {getShopName}=require('../controler/shops');


router.post('/names',getShopName);


module.exports = router;