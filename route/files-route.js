const {exportDataInExcel,allCreadit}=require('../controler/export-data');
const express = require('express');
const router = express.Router();

router.get('/download',exportDataInExcel);
router.get('/view/filter',allCreadit);



module.exports = router;