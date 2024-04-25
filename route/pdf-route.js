const express = require('express');
const router = express.Router();
const {downLoadTermsConditon,downLoadInstallmentSlip,dataForInvoice}=require('../controler/pdf-files')


router.get('/terms-conditon',downLoadTermsConditon);
router.get('/installment-slip',downLoadInstallmentSlip);
router.post('/data/invoice',dataForInvoice);




module.exports = router;