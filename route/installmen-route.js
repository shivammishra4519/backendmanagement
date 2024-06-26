const {viewEmidetailsByNumber,payInstallment,viewPaidEmi,findInstallmentByloanId,viewAllemi,viewPaidEmiForAdmin,payInstallmentOnline,updateInstallmentPayOnline}=require('../controler/installment')
const express = require('express');
const router = express.Router();


router.post('/details',viewEmidetailsByNumber);
router.post('/pay',payInstallment);
router.post('/viewpaidemi',viewPaidEmi);
router.post('/viewloan',findInstallmentByloanId); 
router.post('/viewallemi',viewAllemi); 
router.post('/viewemi/admin',viewPaidEmiForAdmin); 
router.post('/payonline/installment',payInstallmentOnline); 
router.post('/verify/installment',updateInstallmentPayOnline); 

module.exports=router;