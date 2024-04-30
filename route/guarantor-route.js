const {registerGuarantor,checkGurantor,viewGuarantorList,viewGaurantorByNumber,verifyGaurantor}=require('../controler/guarantor')
const express = require('express');
const router = express.Router();



router.post('/register',registerGuarantor);
router.post('/check',checkGurantor);
router.post('/view/list',viewGuarantorList);
router.post('/view/guarantor',viewGaurantorByNumber);
router.post('/verify/guarantor',verifyGaurantor);


module.exports = router;