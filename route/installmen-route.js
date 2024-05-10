const {viewEmidetailsByNumber,payInstallment,viewPaidEmi,findInstallmentByloanId,viewAllemi}=require('../controler/installment')
const express = require('express');
const router = express.Router();


router.post('/details',viewEmidetailsByNumber);
router.post('/pay',payInstallment);
router.post('/viewpaidemi',viewPaidEmi);
router.post('/viewloan',findInstallmentByloanId); 
router.post('/viewallemi',viewAllemi); 

module.exports=router;