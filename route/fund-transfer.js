const express = require('express');
const router = express.Router();
const {fundTransferFunction,transectiondetails}=require('../controler/fund-transfer');


router.post('/transfer',fundTransferFunction);
router.post('/details',transectiondetails);


module.exports = router;