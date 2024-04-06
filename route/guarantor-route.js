const {registerGuarantor}=require('../controler/guarantor')
const express = require('express');
const router = express.Router();



router.post('/register',registerGuarantor);


module.exports = router;