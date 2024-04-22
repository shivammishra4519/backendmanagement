const {registerGuarantor,checkGurantor,viewGuarantorList,viewGaurantorByNumber}=require('../controler/guarantor')
const express = require('express');
const router = express.Router();



router.post('/register',registerGuarantor);
router.post('/check',checkGurantor);
router.post('/view/list',viewGuarantorList);
router.post('/view/guarantor',viewGaurantorByNumber);


module.exports = router;