const express = require('express');
const router = express.Router();
const {onlinePaymentsRequest,checkPaymentStatus,checkUtrIsExit}=require('../controler/payment-controler')


router.post('/requests',onlinePaymentsRequest);
router.post('/status',checkPaymentStatus);
router.post('/utr',checkUtrIsExit);

module.exports=router;