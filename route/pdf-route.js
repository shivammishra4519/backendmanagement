const express = require('express');
const router = express.Router();
const {downLoadTermsConditon,downLoadInstallmentSlip,dataForInvoice,findPlaceOfUserAndCustomer,downloadAggrement,detailsOfAdmin,findLoanDetails,downloadInvoiceForCustomer,downloadGaurntorCondition}=require('../controler/pdf-files')


router.get('/terms-conditon',downLoadTermsConditon);
router.get('/installment-slip',downLoadInstallmentSlip);
router.get('/aggrement',downloadAggrement);
router.post('/data/invoice',dataForInvoice);
router.post('/data/aggrement',findPlaceOfUserAndCustomer);
router.post('/admin/details',detailsOfAdmin);
router.post('/loand/details',findLoanDetails);
router.get('/download/invoice',downloadInvoiceForCustomer);
router.get('/download/gaurantor',downloadGaurntorCondition);




module.exports = router;