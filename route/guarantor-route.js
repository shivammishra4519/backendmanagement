const {registerGuarantor,checkGurantor,viewGuarantorList}=require('../controler/guarantor')
const express = require('express');
const router = express.Router();



router.post('/register',registerGuarantor);
router.post('/check',checkGurantor);
router.post('/view/list',viewGuarantorList);


module.exports = router;