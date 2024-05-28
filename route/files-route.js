const {exportDataInExcel,allCreadit,unpaidEmiToexcel}=require('../controler/export-data');
const express = require('express');
const router = express.Router();

router.post('/download',exportDataInExcel);
router.get('/view/filter',allCreadit);
router.get('/download/unpaidemi',unpaidEmiToexcel);



module.exports = router;