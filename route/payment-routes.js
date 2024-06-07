const express = require('express');
const router = express.Router();
const {onlinePaymentsRequest,checkPaymentStatus}=require('../controler/payment-controler')


router.post('/requests',onlinePaymentsRequest);
router.post('/status',checkPaymentStatus);

module.exports=router;