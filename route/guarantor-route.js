const {registerGuarantor,checkGurantor}=require('../controler/guarantor')
const express = require('express');
const router = express.Router();



router.post('/register',registerGuarantor);
router.post('/check',checkGurantor);


module.exports = router;