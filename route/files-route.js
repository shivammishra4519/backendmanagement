const {exportDataInExcel}=require('../controler/export-data');
const express = require('express');
const router = express.Router();

router.get('/download',exportDataInExcel);



module.exports = router;