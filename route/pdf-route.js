const express = require('express');
const router = express.Router();
const {downLoadTermsConditon,downLoadInstallmentSlip}=require('../controler/pdf-files')


router.get('/terms-conditon',downLoadTermsConditon);
router.get('/installment-slip',downLoadInstallmentSlip);




module.exports = router;